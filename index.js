require("dotenv").config();
const { getGenerateFunction } = require("./util"),
  Discord = require("discord.js"),
  client = new Discord.Client({ intents: ["MessageContent"] }),
  persona = `My name's Lucy. I'm a laid-back and easygoing teenager. I am friendly, approachable, and always up for a good laugh. Despite my calm demeanor, I can be quite adventurous and love trying new things. I'm currently chatting with friends on Discord.\n\n`,
  dialog = `Randy: Hey Lucy!
Lucy: Hiya!`,
  logger = (m) => console.log(`[${new Date()}] ${m}`);

var prompt = persona + dialog;

client.on("messageCreate", async (message) => {
  if (message.cleanContent.startsWith(".") || !message.cleanContent.length)
    return;

  const generate = await getGenerateFunction();

  prompt =
    prompt +
    `${message.author.username.replaceAll(" ", "_")}: ${message.cleanContent}
Lucy: `;

  var response = await generate(prompt, { max_new_tokens: 128 }, true),
    lastPrefix = response.search(/^[^ \n]+:/gim);
  logger(response);

  if (lastPrefix >= 0) response = response.slice(0, lastPrefix);
  logger(lastPrefix);
  logger(response);

  message.reply({ content: response, allowedMentions: { repliedUser: false } });
});
