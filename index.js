require("dotenv").config();
const { getGenerateFunction } = require("./util"),
  Discord = require("discord.js"),
  client = new Discord.Client({
    intents: ["MessageContent", "GuildMessages", "Guilds"],
  }),
  persona = `Lucy's persona: My name's Lucy. I'm a laid-back and easygoing teenager. I am friendly, approachable, and always up for a good laugh. Despite my calm demeanor, I can be quite adventurous and love trying new things. I'm currently chatting with friends on Discord.\n\n`,
  dialog = `Randy: Hey Lucy!
lucy: Hiya!
Randy: What's up?
lucy: Not much, you?
Randy: Same.`,
  logger = (m) => console.log(`[${new Date()}] ${m}`);

client.on("messageCreate", async (message) => {
  if (
    message.cleanContent.trim().startsWith(".") ||
    message.cleanContent.length <= 1 ||
    message.author.id == client.user.id
  )
    return;
  var prompt = persona + dialog;

  logger(`Message received`);
  await message.channel.sendTyping();

  const generate = await getGenerateFunction(),
    history = Array.from(
      (
        await message.channel.messages.fetch({ limit: 25, before: message.id })
      ).values()
    )
      .reverse()
      .filter((m) => m.createdAt.toDateString() == new Date().toDateString())
      .map(
        (m) => `${m.author.username.replaceAll(" ", "_")}: ${m.cleanContent}`
      )
      .join("\n");

  logger(history);

  prompt = `${prompt}
${history}
${message.author.username.replaceAll(" ", "_")}: ${message.cleanContent}
lucy: `;

  var response = await generate(prompt, {}, true),
    lastPrefix = response.search(/^[^ \n]+:/gim);
  logger(response);

  if (lastPrefix >= 0) response = response.slice(0, lastPrefix);
  logger(lastPrefix);
  logger(response);

  prompt = prompt + response;
  logger(prompt);

  message.reply({ content: response, allowedMentions: { repliedUser: false } });
});

client.on("ready", () => {
  logger(`${client.user.username} ready`);
});

client.login(process.env.TOKEN);
