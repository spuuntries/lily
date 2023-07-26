require("dotenv").config();
const { getGenerateFunction } = require("./util"),
  Discord = require("discord.js"),
  client = new Discord.Client({
    intents: ["MessageContent", "GuildMessages", "Guilds"],
  }),
  persona = `lily's persona: My name's Lily. I'm a laid-back and easygoing teenager. I am friendly, approachable, and always up for a good laugh. Despite my calm demeanor, I can be quite adventurous and love trying new things. I'm currently chatting with friends on Discord. (I don't use emojis often)\n\n`,
  dialog = `Randy: Hey Lily!
lily: Hiya!
Randy: What's up?
lily: Not much, you?
Randy: Same.`,
  logger = (m) => console.log(`[${new Date()}] ${m}`);

var generate;

client.on("messageCreate", async (message) => {
  if (
    message.cleanContent.trim().startsWith(".") ||
    message.cleanContent.length <= 1 ||
    message.author.id == client.user.id
  )
    return;
  var prompt = persona + dialog;

  logger(`Message received`);
  message.channel.sendTyping();
  generate = await getGenerateFunction();

  const history = Array.from(
    (
      await message.channel.messages.fetch({ limit: 25, before: message.id })
    ).values()
  )
    .reverse()
    .filter((m) => m.createdAt.toDateString() == new Date().toDateString())
    .map((m) => `${m.author.username.replaceAll(" ", "_")}: ${m.cleanContent}`)
    .join("\n");

  prompt = `${prompt}
${history}
${message.author.username.replaceAll(" ", "_")}: ${message.cleanContent}
lily: `;
  message.channel.sendTyping();
  logger(prompt);

  var response = await generate(
      prompt,
      { do_sample: true, temperature: 0.9 },
      true
    ),
    lastPrefix = response.search(/^[^ \n]+:/gim);
  logger(response);

  if (lastPrefix >= 0) response = response.slice(0, lastPrefix);
  logger(lastPrefix);
  logger(response);
  message.channel.sendTyping();

  prompt = prompt + response;
  logger(prompt);

  message.reply({ content: response, allowedMentions: { repliedUser: false } });
});

client.on("ready", async () => {
  logger(`${client.user.username} ready`);
});

client.login(process.env.TOKEN);
