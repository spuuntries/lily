require("dotenv").config();
const { generate } = require("./util"),
  Discord = require("discord.js"),
  client = new Discord.Client({
    intents: ["MessageContent", "GuildMessages", "Guilds"],
  }),
  persona = `lily's persona: My name's Lily. I'm a laid-back and easygoing teenager. I am friendly, approachable, and always up for a good laugh. Despite my calm demeanor, I can be quite adventurous and love trying new things. It's ${new Date().toUTCString()} right now, I live in Greenwich, which is p neat. I love watching Netflix and binging k-dramas, a bit too much sometimes 😅. I'm currently chatting with friends on Discord, my Discord username is ".lily".\n\n`,
  dialog = `Randy: Hey Lily!
.lily: Hiya!
Randy: What's up?
.lily: Not much, you?
Randy: Same.`,
  logger = (m) => console.log(`[${new Date()}] ${m}`);

client.on("messageCreate", async (message) => {
  if (
    message.cleanContent.trim().includes("!hig") ||
    message.cleanContent.trim().startsWith("!ig") ||
    !message.cleanContent.length ||
    message.author.id == client.user.id ||
    !process.env.LISTEN.split("|").includes(message.channelId)
  )
    return;
  var prompt = persona + dialog;

  logger(`Message received`);
  let typing = true;
  const keepTyping = () => {
    if (typing) {
      message.channel.sendTyping();
      setTimeout(keepTyping, 9000);
    }
  };
  keepTyping();

  /**
   *
   * @param {Discord.Message[]} messages
   * @returns
   */
  function filterMessages(messages) {
    let index = 0;
    while (index < messages.length) {
      if (messages[index].content.includes("!hig")) break;
      index++;
    }
    return messages.slice(0, index);
  }

  const history = filterMessages(
    Array.from(
      (
        await message.channel.messages.fetch({ limit: 60, before: message.id })
      ).values()
    ).filter((m) => !m.content.toLowerCase().trim().includes("!ig"))
  )
    .map((m) => `${m.author.username.replaceAll(" ", "_")}: ${m.cleanContent}`)
    .reverse()
    .join("\n");

  prompt = `${prompt}
${history}
${message.author.username.replaceAll(" ", "_")}: ${message.cleanContent}
.lily: `;
  logger(prompt);

  var response = await generate(prompt, true);
  logger(response);

  const lastPrefix = response.search(/^[^ \n]+:/gim);

  if (lastPrefix >= 0) response = response.slice(0, lastPrefix);
  logger(lastPrefix);
  logger(response);

  prompt = prompt + response;
  logger(prompt);
  typing = false;

  message.reply({ content: response, allowedMentions: { repliedUser: false } });
});

client.on("ready", async () => {
  logger(`${client.user.username} ready`);
});

client.login(process.env.TOKEN);
