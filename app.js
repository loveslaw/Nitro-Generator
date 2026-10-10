/**
 * Discord Nitro Generator & Checker
 * High-speed asynchronous generator and validator with webhook dispatch
 */

const fs = require('fs');
const axios = require('axios');
const yaml = require('js-yaml');
const chalk = require('chalk');

let config;
try {
  config = yaml.load(fs.readFileSync('config.yml', 'utf8'));
} catch (e) {
  console.error('Error loading config.yml:', e.message);
  process.exit(1);
}

const CHARSET = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';

function generateCode(length = 16) {
  let result = '';
  for (let i = 0; i < length; i++) {
    result += CHARSET.charAt(Math.floor(Math.random() * CHARSET.length));
  }
  return result;
}

let stats = {
  checked: 0,
  valid: 0,
  invalid: 0,
  rateLimited: 0,
  errors: 0
};

async function sendWebhook(code) {
  if (!config.webhook || !config.webhook.enabled || !config.webhook.url.startsWith('http')) return;
  try {
    await axios.post(config.webhook.url, {
      content: config.webhook.mention_on_hit || '',
      embeds: [{
        title: '🎉 Valid Nitro Code Detected!',
        description: `**Code:** https://discord.gift/${code}\n**Timestamp:** ${new Date().toISOString()}`,
        color: 0x5865F2,
        footer: { text: 'Nitro Generator & Checker' }
      }]
    });
  } catch (err) {
    console.error(chalk.red('[Webhook Error] Failed to post hit:'), err.message);
  }
}

async function checkCode(code) {
  const url = `https://discord.com/api/v10/entitlements/gift-codes/${code}?with_application=false&with_subscription_plan=true`;
  try {
    const res = await axios.get(url, {
      timeout: 5000,
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
      }
    });

    if (res.status === 200) {
      stats.valid++;
      stats.checked++;
      console.log(chalk.green.bold(`[HIT] Valid code found: https://discord.gift/${code}`));
      if (config.logging.save_valid) {
        fs.appendFileSync(config.logging.output_file || 'valid_codes.txt', `https://discord.gift/${code}\n`);
      }
      await sendWebhook(code);
    }
  } catch (err) {
    stats.checked++;
    if (err.response) {
      if (err.response.status === 404) {
        stats.invalid++;
        if (config.logging.log_invalid) {
          console.log(chalk.gray(`[INVALID] https://discord.gift/${code}`));
        }
      } else if (err.response.status === 429) {
        stats.rateLimited++;
        const retryAfter = err.response.headers['retry-after'] || 5;
        console.log(chalk.yellow(`[RATE LIMITED] 429 received. Cooldown: ${retryAfter}s`));
        await new Promise(r => setTimeout(r, retryAfter * 1000));
      } else {
        stats.errors++;
      }
    } else {
      stats.errors++;
    }
  }
}

async function worker() {
  while (true) {
    const code = generateCode(config.settings.code_length || 16);
    await checkCode(code);
    if (config.settings.check_delay_ms) {
      await new Promise(r => setTimeout(r, config.settings.check_delay_ms));
    }
  }
}

function printStats() {
  process.stdout.write(
    `\r${chalk.cyan('[STATUS]')} Checked: ${stats.checked} | ` +
    `${chalk.green('Valid: ' + stats.valid)} | ` +
    `${chalk.red('Invalid: ' + stats.invalid)} | ` +
    `${chalk.yellow('Rate Limits: ' + stats.rateLimited)} | ` +
    `Errors: ${stats.errors}`
  );
}

async function main() {
  console.clear();
  console.log(chalk.magenta.bold('========================================='));
  console.log(chalk.magenta.bold('    DISCORD NITRO GENERATOR & CHECKER    '));
  console.log(chalk.magenta.bold('========================================='));
  console.log(chalk.blue(`[INIT] Launching ${config.settings.threads || 5} concurrent worker threads...\n`));

  setInterval(printStats, 1000);

  const threads = config.settings.threads || 5;
  const workers = [];
  for (let i = 0; i < threads; i++) {
    workers.push(worker());
  }

  await Promise.all(workers);
}

main().catch(console.error);
