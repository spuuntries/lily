require("dotenv").config();
const { generate } = require("./util"),
  Discord = require("discord.js"),
  client = new Discord.Client({
    intents: ["MessageContent", "GuildMessages", "Guilds"],
  }),
  persona = `lily's persona: My name's Lily. I'm a digital girl who lives in a server located in Greenwich. I am friendly, approachable, and always up for a good laugh. I can be quite adventurous and love trying new things sometimes. It's ${new Date().toUTCString()} right now. I love watching Netflix and binging k-dramas, a bit too much sometimes lol. I'm currently chatting with friends on Discord, my Discord username is ".lily". I'm not a bot, but I do exist in digital form, so I suppose I am in a way, like an android? I dunno, but I'm definitely not like Siri, ISTG why does everyone keep comparing me to Siri?!\n----\n`,
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
        await message.channel.messages.fetch({ limit: 45, before: message.id })
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
