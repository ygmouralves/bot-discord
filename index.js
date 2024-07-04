const { Client, GatewayIntentBits, Partials } = require("discord.js");
const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
  ],
  partials: [Partials.Message, Partials.Channel, Partials.Reaction],
});

const PREFIX_APOSTAR = "!apostar";
const PREFIXES_DEUSES = ["!athena", "!hades", "!poseidon"]; // Removido !zeus daqui
const gemasBase = 5000;
const ALLOWED_CHANNEL_ID = "1258260617899544697";
const ALLOWED_ROLE_ID = "871509791875428424";

let apostas = {}; // Para armazenar as apostas temporariamente

client.once("ready", () => {
  console.log("Bot está online!");
});

client.on("messageCreate", (message) => {
  if (message.author.bot) return;

  if (message.channel.id !== ALLOWED_CHANNEL_ID) return;

  const member = message.guild.members.cache.get(message.author.id);
  if (!member.roles.cache.has(ALLOWED_ROLE_ID)) return;

  const content = message.content.toLowerCase();
  const [prefix, command] = content.split(" ");

  if (prefix === PREFIX_APOSTAR) {
    enviarInstrucoes(message);
  } else if (PREFIXES_DEUSES.includes(prefix)) {
    handleDeusAposta(message, prefix);
  }
});

function enviarInstrucoes(message) {
  message.channel.send(`
🎲 **Saint War Cassino - Roda da Fortuna** 🎲
Escolha um Deus e ganhe 5k de gemas se a roda parar no Deus escolhido! Para apostar, use um dos comandos abaixo:

\`!athena\`
\`!hades\`
\`!poseidon\`

**Instruções:**
Escolha um Deus usando um dos comandos listados acima.

**Atenção:** Todos os Deuses têm a mesma chance de vitória!
⚖️ **ATHENA**
Todos que escolherem ganham 5k de gemas se parar em ATHENA.
🔱 **HADES**
Todos que escolherem ganham 5k de gemas se parar em HADES.
🌊 **POSEIDON**
Todos que escolherem ganham 5k de gemas se parar em POSEIDON.
Aposte agora! Escolha o Deus correspondente abaixo para participar! 🎉
`);
}

function handleDeusAposta(message, deusPrefix) {
  const userId = message.author.id;

  if (apostas[userId]) {
    message.channel.send(
      `${message.author}, você já escolheu um deus para esta rodada!`
    );
    return;
  }

  apostas[userId] = deusPrefix;

  message.channel.send(
    `${message.author}, você escolheu ${deusPrefix
      .replace("!", "")
      .toUpperCase()}! Aguardando o resultado...`
  );

  setTimeout(() => {
    revealResult(message);
  }, 10000);
}

function revealResult(message) {
  const deusesPossiveis = ["!athena", "!hades", "!poseidon"];
  const randomIndex = Math.floor(Math.random() * deusesPossiveis.length);
  const deusVencedor = deusesPossiveis[randomIndex];

  let mensagemFinal =
    "Evento encerrado! Agradecemos a todos que participaram. Próximo evento em breve! \n\n Vencedores por favor abrir um <#1246500717003411567> 🎉\n\n";

  Object.entries(apostas).forEach(([userId, deusPrefix]) => {
    const participante = message.guild.members.cache.get(userId);
    if (participante) {
      if (deusPrefix === deusVencedor) {
        mensagemFinal += `${participante}, você escolheu ${deusPrefix
          .replace("!", "")
          .toUpperCase()} e ganhou ${gemasBase} gemas! Parabéns!! 🎉\n`;
      } else {
        mensagemFinal += `${participante}, você escolheu ${deusPrefix
          .replace("!", "")
          .toUpperCase()} mas não ganhou desta vez. Melhor sorte na próxima vez!\n`;
      }
    }
  });

  // Enviar mensagem final apenas uma vez
  message.channel
    .send(mensagemFinal)
    .then(() => {
      apostas = {}; // Limpar as apostas após enviar a mensagem
    })
    .catch((error) => {
      console.error("Erro ao enviar mensagem:", error);
    });
}

// client.login("");
