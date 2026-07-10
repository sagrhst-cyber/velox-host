require('dotenv').config();
const http = require('http');
const {
    Client, GatewayIntentBits, ChannelType, PermissionFlagsBits,
    ContainerBuilder, TextDisplayBuilder, ThumbnailBuilder,
    MediaGalleryBuilder, MediaGalleryItemBuilder,
    SectionBuilder, SeparatorBuilder,
    ActionRowBuilder, ButtonBuilder, ButtonStyle,
    StringSelectMenuBuilder, EmbedBuilder,
    ModalBuilder, TextInputBuilder, TextInputStyle
} = require('discord.js');
const { v2Message } = require('./utils/v2');

const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMembers,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent
    ]
});

const TICKET_BANNER = 'https://cdn.discordapp.com/attachments/1523746122131308625/1523746157052821534/mikro_banner.jfif?ex=6a4d3ab1&is=6a4be931&hm=21e3c40f150525cea23b8e42066b1f4e9e88a3634c48ec22257987156878d57d&';
const TICKET_LOGO = 'https://cdn.discordapp.com/attachments/1523746122131308625/1523746353790844999/galazio_velox_bot.png?ex=6a4d3ae0&is=6a4be960&hm=e0abf3d920004105d2a1943c62db6a44005892b38db6611d74c6bdf676c08a72&';
const RATINGS_CHANNEL_ID = '1523834655760187412';
const EXCHANGE_HISTORY_CHANNEL_ID = '1523725694230724739';

const CATEGORIES = [
    { label: 'General Support', value: 'general', emoji: '<:support_global:1360274659290906866>', description: 'Get help with general questions' },
    { label: 'Partnership', value: 'partnership', emoji: '<:partnershine:1465329399610998930>', description: 'Business inquiries and partnerships' },
    { label: 'Technical Issue', value: 'technical', emoji: '<:velox:1523718046546530365>', description: 'Report a bug or technical problem' }
];

const userSelections = new Map();
const ticketInfo = new Map();
const pendingRatings = new Map();
const exchangeData = new Map();
const exchangeTickets = new Map();

function getSubjectLabel(subject) {
    const cat = CATEGORIES.find(c => c.value === subject);
    return cat ? cat.label : 'Support';
}

// ==================== TICKET PANEL (Categories) ====================

function buildTicketPanel() {
    const container = new ContainerBuilder();
    container.setAccentColor(0x0099ff);

    container.addMediaGalleryComponents(
        new MediaGalleryBuilder().addItems(
            new MediaGalleryItemBuilder().setURL(TICKET_BANNER)
        )
    );

    container.addSeparatorComponents(new SeparatorBuilder());

    container.addSectionComponents(
        new SectionBuilder()
            .addTextDisplayComponents(
                new TextDisplayBuilder().setContent('# <:velox:1523718046546530365> __**Velox Bots — Assistance Center**__')
            )
            .setThumbnailAccessory(
                new ThumbnailBuilder().setURL(TICKET_LOGO)
            )
    );

    container.addSeparatorComponents(new SeparatorBuilder());

    const selectMenu = new StringSelectMenuBuilder()
        .setCustomId('ticket_select')
        .setPlaceholder('Choose a ticket category...')
        .addOptions(
            CATEGORIES.map(cat => ({
                label: cat.label,
                value: cat.value,
                emoji: { name: cat.label === 'General Support' ? 'support_global' : cat.label === 'Partnership' ? 'partnershine' : 'velox', id: cat.emoji.match(/\d+/)[0] },
                description: cat.description
            }))
        );

    container.addActionRowComponents(
        new ActionRowBuilder().addComponents(selectMenu)
    );

    container.addSeparatorComponents(new SeparatorBuilder());

    container.addTextDisplayComponents(
        new TextDisplayBuilder().setContent('# <a:quest:1523828230858211450> __**— How It Works?**__')
    );

    container.addTextDisplayComponents(
        new TextDisplayBuilder().setContent(
            '> • We\'ll open a private ticket for you to speak directly with our support team.\n' +
            '> • We\'ll get back to you as soon as possible with any assistance you will need.\n' +
            '> • Please attach any necessary documents to support a better prompt resolution.'
        )
    );

    return container;
}

function buildTicketContainer(subject, user) {
    const container = new ContainerBuilder();
    container.setAccentColor(0xff0000);

    container.addMediaGalleryComponents(
        new MediaGalleryBuilder().addItems(
            new MediaGalleryItemBuilder().setURL(TICKET_BANNER)
        )
    );

    container.addSeparatorComponents(new SeparatorBuilder());

    container.addTextDisplayComponents(
        new TextDisplayBuilder().setContent('### <:eisitiro:1523831893466943558> ' + getSubjectLabel(subject) + ' Ticket')
    );

    container.addTextDisplayComponents(
        new TextDisplayBuilder().setContent('<a:arrow:1523832007941947543> Opened by <@' + user.id + '>')
    );

    container.addSeparatorComponents(new SeparatorBuilder());

    container.addTextDisplayComponents(
        new TextDisplayBuilder().setContent('<:velox:1523718046546530365> Describe your issue and a Velox Bots staff member will assist you shortly.')
    );

    container.addSeparatorComponents(new SeparatorBuilder());

    container.addActionRowComponents(
        new ActionRowBuilder().addComponents(
            new ButtonBuilder()
                .setCustomId('ticket_claim')
                .setLabel('Claim Ticket')
                .setEmoji({ name: 'Star_dragon', id: '1494003109607768237' })
                .setStyle(ButtonStyle.Primary),
            new ButtonBuilder()
                .setCustomId('ticket_close')
                .setLabel('Close Ticket')
                .setEmoji({ name: 'close', id: '1514086733757681715' })
                .setStyle(ButtonStyle.Danger)
        )
    );

    return container;
}

function buildTOSPanel() {
    const container = new ContainerBuilder();
    container.setAccentColor(0x0099ff);

    container.addMediaGalleryComponents(
        new MediaGalleryBuilder().addItems(
            new MediaGalleryItemBuilder().setURL(TICKET_BANNER)
        )
    );

    container.addSeparatorComponents(new SeparatorBuilder());

    container.addSectionComponents(
        new SectionBuilder()
            .addTextDisplayComponents(
                new TextDisplayBuilder().setContent('# <:velox:1523718046546530365> __**Velox Bots — T.O.S**__')
            )
            .setThumbnailAccessory(
                new ThumbnailBuilder().setURL(TICKET_LOGO)
            )
    );

    container.addSeparatorComponents(new SeparatorBuilder());

    container.addTextDisplayComponents(
        new TextDisplayBuilder().setContent('We recommend checking our **Terms of Service** before buying anything from our products & services, just click the button below.')
    );

    container.addSeparatorComponents(new SeparatorBuilder());

    container.addActionRowComponents(
        new ActionRowBuilder().addComponents(
            new ButtonBuilder()
                .setCustomId('tos_open')
                .setLabel('T.O.S')
                .setEmoji({ name: 'eisitiro', id: '1523831893466943558' })
                .setStyle(ButtonStyle.Danger),
            new ButtonBuilder()
                .setLabel('For any problem open ticket')
                .setURL('https://discord.com/channels/1523717705130315877/1523723214260404385')
                .setStyle(ButtonStyle.Link)
        )
    );

    return container;
}

function buildTOSContent() {
    const container = new ContainerBuilder();
    container.setAccentColor(0x0099ff);

    container.addMediaGalleryComponents(
        new MediaGalleryBuilder().addItems(
            new MediaGalleryItemBuilder().setURL(TICKET_BANNER)
        )
    );

    container.addSeparatorComponents(new SeparatorBuilder());

    container.addTextDisplayComponents(
        new TextDisplayBuilder().setContent('# <:velox:1523718046546530365> __**Velox Bots — T.O.S**__')
    );

    container.addSeparatorComponents(new SeparatorBuilder());

    container.addTextDisplayComponents(
        new TextDisplayBuilder().setContent(
            '**1.** All sales are final. Refunds are not guaranteed unless approved by staff.\n' +
            '**2.** Bot licenses are valid for the duration purchased only.\n' +
            '**3.** You may not redistribute, resell, or share any purchased bot.\n' +
            '**4.** Velox Bots is not responsible for any misuse of the bots.\n' +
            '**5.** Terms may change at any time without prior notice.\n' +
            '**6.** By purchasing, you agree to all terms listed above.'
        )
    );

    container.addSeparatorComponents(new SeparatorBuilder());

    container.addActionRowComponents(
        new ActionRowBuilder().addComponents(
            new ButtonBuilder()
                .setCustomId('tos_back')
                .setLabel('Back')
                .setEmoji({ name: 'arrow', id: '1523832007941947543' })
                .setStyle(ButtonStyle.Secondary)
                .setDisabled(true)
        )
    );

    return container;
}

// ==================== VERIFY PANEL ====================

function buildVerifyPanel() {
    const container = new ContainerBuilder();
    container.setAccentColor(0x0099ff);

    container.addMediaGalleryComponents(
        new MediaGalleryBuilder().addItems(
            new MediaGalleryItemBuilder().setURL(TICKET_BANNER)
        )
    );

    container.addSeparatorComponents(new SeparatorBuilder());

    container.addSectionComponents(
        new SectionBuilder()
            .addTextDisplayComponents(
                new TextDisplayBuilder().setContent('# <:velox:1523718046546530365> __**Verification**__')
            )
            .setThumbnailAccessory(
                new ThumbnailBuilder().setURL(TICKET_LOGO)
            )
    );

    container.addSeparatorComponents(new SeparatorBuilder());

    container.addTextDisplayComponents(
        new TextDisplayBuilder().setContent(
            'Welcome to **Velox Bots**!\n\n' +
            'To access the server, you need to verify yourself.\n' +
            'Click the button below and solve the captcha to get verified.'
        )
    );

    container.addSeparatorComponents(new SeparatorBuilder());

    container.addActionRowComponents(
        new ActionRowBuilder().addComponents(
            new ButtonBuilder()
                .setCustomId('verify_start')
                .setLabel('Verify')
                .setEmoji({ name: 'Verify', id: '1489821802296250509' })
                .setStyle(ButtonStyle.Success)
        )
    );

    return container;
}

function generateCaptcha() {
    const code = Math.floor(Math.random() * 9000) + 1000;
    return { question: 'Type the number: **' + code + '**', answer: code.toString() };
}

// ==================== STATUS PANEL ====================

function buildStatusPanel(guild, client) {
    const container = new ContainerBuilder();
    container.setAccentColor(0x0099ff);

    container.addMediaGalleryComponents(
        new MediaGalleryBuilder().addItems(
            new MediaGalleryItemBuilder().setURL(TICKET_BANNER)
        )
    );

    container.addSeparatorComponents(new SeparatorBuilder());

    container.addSectionComponents(
        new SectionBuilder()
            .addTextDisplayComponents(
                new TextDisplayBuilder().setContent('# <:velox:1523718046546530365> __**Velox Bots — Status**__')
            )
            .setThumbnailAccessory(
                new ThumbnailBuilder().setURL(TICKET_LOGO)
            )
    );

    container.addSeparatorComponents(new SeparatorBuilder());

    container.addTextDisplayComponents(
        new TextDisplayBuilder().setContent('# <a:bot:1524075508407468224> __**Bot Stats**__')
    );

    const uptime = formatUptime(client.uptime);
    const ping = client.ws.ping;

    container.addTextDisplayComponents(
        new TextDisplayBuilder().setContent(
            '> **Ping:** `' + ping + 'ms`\n' +
            '> **Uptime:** `' + uptime + '`\n' +
            '> **Servers:** `' + client.guilds.cache.size + '`\n' +
            '> **Commands:** `5`'
        )
    );

    container.addSeparatorComponents(new SeparatorBuilder());

    container.addTextDisplayComponents(
        new TextDisplayBuilder().setContent('# <a:status:1524171588440953004> __**Server Stats**__')
    );

    const totalMembers = guild.memberCount;
    const onlineMembers = guild.members.cache.filter(m => m.presence?.status !== 'offline').size;
    const totalChannels = guild.channels.cache.size;
    const textChannels = guild.channels.cache.filter(c => c.type === ChannelType.GuildText).size;
    const voiceChannels = guild.channels.cache.filter(c => c.type === ChannelType.GuildVoice).size;
    const roles = guild.roles.cache.size;
    const boostLevel = guild.premiumTier;
    const boosts = guild.premiumSubscriptionCount || 0;

    container.addTextDisplayComponents(
        new TextDisplayBuilder().setContent(
            '> **Members:** `' + totalMembers + '` (Online: `' + onlineMembers + '`)\n' +
            '> **Channels:** `' + totalChannels + '` (Text: `' + textChannels + '` | Voice: `' + voiceChannels + '`)\n' +
            '> **Roles:** `' + roles + '`\n' +
            '> **Boost Level:** `' + boostLevel + '` (' + boosts + ' boosts)'
        )
    );

    const orderExecRole = guild.roles.cache.get('1523724009013907496');
    const orderExecMembers = orderExecRole ? orderExecRole.members : guild.members.cache.filter(m => m.roles.cache.has('1523724009013907496'));
    const orderExecOnline = orderExecMembers.filter(m => m.presence?.status === 'online' || m.presence?.status === 'idle' || m.presence?.status === 'dnd');

    container.addSeparatorComponents(new SeparatorBuilder());

    container.addTextDisplayComponents(
        new TextDisplayBuilder().setContent('# <a:order:1524172940550213752> __**Order Execution**__')
    );

    let orderExecList = '';
    orderExecMembers.forEach(m => {
        const status = m.presence?.status === 'online' ? '🟢' : m.presence?.status === 'idle' ? '🟡' : m.presence?.status === 'dnd' ? '🔴' : '⚫';
        orderExecList += status + ' <@' + m.id + '>\n';
    });

    if (orderExecList) {
        container.addTextDisplayComponents(
            new TextDisplayBuilder().setContent(orderExecList)
        );
    } else {
        container.addTextDisplayComponents(
            new TextDisplayBuilder().setContent('*No members with this role.*')
        );
    }

    return container;
}

function formatUptime(ms) {
    const s = Math.floor(ms / 1000);
    const d = Math.floor(s / 86400);
    const h = Math.floor((s % 86400) / 3600);
    const m = Math.floor((s % 3600) / 60);
    const sec = s % 60;
    const parts = [];
    if (d > 0) parts.push(d + 'd');
    if (h > 0) parts.push(h + 'h');
    if (m > 0) parts.push(m + 'm');
    parts.push(sec + 's');
    return parts.join(' ');
}

// ==================== TICKETBOT PANEL (Custom Bot) ====================

function buildBotPanel() {
    const container = new ContainerBuilder();
    container.setAccentColor(0x0099ff);

    container.addMediaGalleryComponents(
        new MediaGalleryBuilder().addItems(
            new MediaGalleryItemBuilder().setURL(TICKET_BANNER)
        )
    );

    container.addSeparatorComponents(new SeparatorBuilder());

    container.addSectionComponents(
        new SectionBuilder()
            .addTextDisplayComponents(
                new TextDisplayBuilder().setContent('# <:velox:1523718046546530365> __**Velox Order Panel**__')
            )
            .setThumbnailAccessory(
                new ThumbnailBuilder().setURL(TICKET_LOGO)
            )
    );

    container.addSeparatorComponents(new SeparatorBuilder());

    container.addTextDisplayComponents(
        new TextDisplayBuilder().setContent(
            '• Our team is available to assist with any order-related questions.\n' +
            '• While response times may be slightly delayed during busy periods,\n' +
            '• we\'ll respond as quickly as possible.'
        )
    );

    container.addSeparatorComponents(new SeparatorBuilder());

    container.addTextDisplayComponents(
        new TextDisplayBuilder().setContent('# <a:bot:1524075508407468224> __**Custom Bot**__')
    );

    container.addTextDisplayComponents(
        new TextDisplayBuilder().setContent(
            '**<a:arrow:1523832007941947543> Build a custom bot that matches your business. Customize its responses, personality, and workflow to fit your brand.**'
        )
    );

    container.addSeparatorComponents(new SeparatorBuilder());

    container.addTextDisplayComponents(
        new TextDisplayBuilder().setContent('# <a:securityloading:1524415908242788523> __**Security Bot**__')
    );

    container.addTextDisplayComponents(
        new TextDisplayBuilder().setContent(
            '**<a:arrow:1523832007941947543> Enhance your server\'s security with a bot that helps detect threats, enforce rules, and keep your community safe.**'
        )
    );

    container.addSeparatorComponents(new SeparatorBuilder());

    container.addTextDisplayComponents(
        new TextDisplayBuilder().setContent('**Note:** Please check our [Terms Of Service](https://discord.com/channels/1523717705130315877/1523723223131488412) before starting!')
    );

    container.addActionRowComponents(
        new ActionRowBuilder().addComponents(
            new ButtonBuilder()
                .setCustomId('custom_bot')
                .setLabel('Custom Bot')
                .setEmoji({ name: 'bot', id: '1524075508407468224' })
                .setStyle(ButtonStyle.Primary),
            new ButtonBuilder()
                .setCustomId('security_bot')
                .setLabel('Security Bot')
                .setEmoji({ name: 'securityloading', id: '1524415908242788523' })
                .setStyle(ButtonStyle.Primary)
        )
    );

    return container;
}

function buildBotTypePanel() {
    const container = new ContainerBuilder();
    container.setAccentColor(0x0099ff);

    container.addMediaGalleryComponents(
        new MediaGalleryBuilder().addItems(
            new MediaGalleryItemBuilder().setURL(TICKET_BANNER)
        )
    );

    container.addSeparatorComponents(new SeparatorBuilder());

    container.addTextDisplayComponents(
        new TextDisplayBuilder().setContent('# <:velox:1523718046546530365> __**Select Bot Type**__')
    );

    container.addTextDisplayComponents(
        new TextDisplayBuilder().setContent('What type of bot do you need?')
    );

    container.addSeparatorComponents(new SeparatorBuilder());

    container.addActionRowComponents(
        new ActionRowBuilder().addComponents(
            new ButtonBuilder().setCustomId('bottype_server').setLabel('Custom Bot for Server').setEmoji({ name: 'bot', id: '1524075508407468224' }).setStyle(ButtonStyle.Secondary),
            new ButtonBuilder().setCustomId('bottype_security').setLabel('Security Bot').setEmoji({ name: 'Security_Loading', id: '1270761981896425483' }).setStyle(ButtonStyle.Secondary)
        )
    );

    return container;
}

function buildDurationPanel(botType) {
    const container = new ContainerBuilder();
    container.setAccentColor(0x0099ff);

    container.addMediaGalleryComponents(
        new MediaGalleryBuilder().addItems(
            new MediaGalleryItemBuilder().setURL(TICKET_BANNER)
        )
    );

    container.addSeparatorComponents(new SeparatorBuilder());

    container.addTextDisplayComponents(
        new TextDisplayBuilder().setContent('# <:velox:1523718046546530365> __**Select Duration**__')
    );

    container.addTextDisplayComponents(
        new TextDisplayBuilder().setContent('**Bot Type:** ' + botType + '\n\nHow long do you need your bot?')
    );

    container.addSeparatorComponents(new SeparatorBuilder());

    container.addActionRowComponents(
        new ActionRowBuilder().addComponents(
            new ButtonBuilder().setCustomId('duration_week').setLabel('Week').setEmoji({ name: 'time', id: '1519925964463804527' }).setStyle(ButtonStyle.Secondary),
            new ButtonBuilder().setCustomId('duration_month').setLabel('Month').setEmoji({ name: 'time', id: '1519925964463804527' }).setStyle(ButtonStyle.Secondary),
            new ButtonBuilder().setCustomId('duration_year').setLabel('Year').setEmoji({ name: 'time', id: '1519925964463804527' }).setStyle(ButtonStyle.Secondary)
        )
    );

    return container;
}

function buildPaymentPanel(duration) {
    const container = new ContainerBuilder();
    container.setAccentColor(0x0099ff);

    container.addMediaGalleryComponents(
        new MediaGalleryBuilder().addItems(
            new MediaGalleryItemBuilder().setURL(TICKET_BANNER)
        )
    );

    container.addSeparatorComponents(new SeparatorBuilder());

    container.addTextDisplayComponents(
        new TextDisplayBuilder().setContent('# <:velox:1523718046546530365> __**Select Payment Method**__')
    );

    container.addTextDisplayComponents(
        new TextDisplayBuilder().setContent('**Duration:** ' + duration + '\n\nChoose your payment method:')
    );

    container.addSeparatorComponents(new SeparatorBuilder());

    container.addActionRowComponents(
        new ActionRowBuilder().addComponents(
            new ButtonBuilder().setCustomId('pay_paysafe').setLabel('Paysafe').setEmoji({ name: 'paysafe', id: '1362775322126319626' }).setStyle(ButtonStyle.Secondary),
            new ButtonBuilder().setCustomId('pay_paypal').setLabel('PayPal').setEmoji({ name: 'PayPal', id: '1470496536302588057' }).setStyle(ButtonStyle.Secondary),
            new ButtonBuilder().setCustomId('pay_crypto').setLabel('Crypto').setEmoji({ name: 'CRYPTO', id: '1238201645771264041' }).setStyle(ButtonStyle.Secondary)
        )
    );

    return container;
}

function buildPaysafePanel(duration) {
    const container = new ContainerBuilder();
    container.setAccentColor(0x0099ff);

    container.addMediaGalleryComponents(
        new MediaGalleryBuilder().addItems(
            new MediaGalleryItemBuilder().setURL(TICKET_BANNER)
        )
    );

    container.addSeparatorComponents(new SeparatorBuilder());

    container.addTextDisplayComponents(
        new TextDisplayBuilder().setContent('# <:velox:1523718046546530365> __**Select Paysafe Type**__')
    );

    container.addTextDisplayComponents(
        new TextDisplayBuilder().setContent('**Duration:** ' + duration + '\n**Payment:** Paysafe\n\nChoose your Paysafe type:')
    );

    container.addSeparatorComponents(new SeparatorBuilder());

    container.addActionRowComponents(
        new ActionRowBuilder().addComponents(
            new ButtonBuilder().setCustomId('paysafe_greek').setLabel('Greek Paysafe').setEmoji({ name: 'Greece', id: '1238239362093809664' }).setStyle(ButtonStyle.Secondary),
            new ButtonBuilder().setCustomId('paysafe_german').setLabel('German Paysafe').setEmoji({ name: 'Germanpaysafe', id: '1513872657945202818' }).setStyle(ButtonStyle.Secondary)
        )
    );

    return container;
}

function buildCryptoPanel(duration) {
    const container = new ContainerBuilder();
    container.setAccentColor(0x0099ff);

    container.addMediaGalleryComponents(
        new MediaGalleryBuilder().addItems(
            new MediaGalleryItemBuilder().setURL(TICKET_BANNER)
        )
    );

    container.addSeparatorComponents(new SeparatorBuilder());

    container.addTextDisplayComponents(
        new TextDisplayBuilder().setContent('# <:velox:1523718046546530365> __**Select Crypto**__')
    );

    container.addTextDisplayComponents(
        new TextDisplayBuilder().setContent('**Duration:** ' + duration + '\n**Payment:** Crypto\n\nChoose your cryptocurrency:')
    );

    container.addSeparatorComponents(new SeparatorBuilder());

    container.addActionRowComponents(
        new ActionRowBuilder().addComponents(
            new ButtonBuilder().setCustomId('crypto_ltc').setLabel('LTC').setEmoji({ name: 'LTC', id: '1505168789745176758' }).setStyle(ButtonStyle.Secondary),
            new ButtonBuilder().setCustomId('crypto_btc').setLabel('Bitcoin').setEmoji({ name: 'BitCoin', id: '1469693053857173559' }).setStyle(ButtonStyle.Secondary),
            new ButtonBuilder().setCustomId('crypto_sol').setLabel('Solana').setEmoji({ name: 'Solana', id: '1520794734468010205' }).setStyle(ButtonStyle.Secondary),
            new ButtonBuilder().setCustomId('crypto_eth').setLabel('Ethereum').setEmoji({ name: 'etherium', id: '1499862930144100533' }).setStyle(ButtonStyle.Secondary)
        )
    );

    return container;
}

function buildBotTicketContainer(botType, duration, payment, paymentType, user) {
    const container = new ContainerBuilder();
    container.setAccentColor(0xff0000);

    container.addMediaGalleryComponents(
        new MediaGalleryBuilder().addItems(
            new MediaGalleryItemBuilder().setURL(TICKET_BANNER)
        )
    );

    container.addSeparatorComponents(new SeparatorBuilder());

    container.addTextDisplayComponents(
        new TextDisplayBuilder().setContent('### <:eisitiro:1523831893466943558> ' + botType + ' Purchase')
    );

    container.addSeparatorComponents(new SeparatorBuilder());

    container.addTextDisplayComponents(
        new TextDisplayBuilder().setContent(
            '<a:arrow:1523832007941947543> **Bot Type:** ' + botType + '\n' +
            '<a:arrow:1523832007941947543> **Duration:** ' + duration + '\n' +
            '<a:arrow:1523832007941947543> **Payment:** ' + payment + '\n' +
            (paymentType ? '<a:arrow:1523832007941947543> **Type:** ' + paymentType + '\n' : '')
        )
    );

    container.addSeparatorComponents(new SeparatorBuilder());

    container.addTextDisplayComponents(
        new TextDisplayBuilder().setContent('<:velox:1523718046546530365> Please describe what you need and a staff member will assist you shortly.')
    );

    container.addSeparatorComponents(new SeparatorBuilder());

    container.addActionRowComponents(
        new ActionRowBuilder().addComponents(
            new ButtonBuilder().setCustomId('ticket_claim').setLabel('Claim Ticket').setEmoji({ name: 'Star_dragon', id: '1494003109607768237' }).setStyle(ButtonStyle.Primary),
            new ButtonBuilder().setCustomId('ticket_close').setLabel('Close Ticket').setEmoji({ name: 'close', id: '1514086733757681715' }).setStyle(ButtonStyle.Danger)
        )
    );

    return container;
}

// ==================== RATE PANEL ====================

function buildRatePanel() {
    const container = new ContainerBuilder();
    container.setAccentColor(0x0099ff);

    container.addMediaGalleryComponents(
        new MediaGalleryBuilder().addItems(
            new MediaGalleryItemBuilder().setURL(TICKET_BANNER)
        )
    );

    container.addSeparatorComponents(new SeparatorBuilder());

    container.addTextDisplayComponents(
        new TextDisplayBuilder().setContent('# <:velox:1523718046546530365> __**Rate Your Experience**__')
    );

    container.addSectionComponents(
        new SectionBuilder()
            .addTextDisplayComponents(
                new TextDisplayBuilder().setContent('How would you rate your support experience?')
            )
            .setThumbnailAccessory(
                new ThumbnailBuilder().setURL(TICKET_LOGO)
            )
    );

    container.addSeparatorComponents(new SeparatorBuilder());

    container.addActionRowComponents(
        new ActionRowBuilder().addComponents(
            new ButtonBuilder().setCustomId('rate_1').setLabel('1').setEmoji({ name: 'starblue', id: '1524029269490139166' }).setStyle(ButtonStyle.Secondary),
            new ButtonBuilder().setCustomId('rate_2').setLabel('2').setEmoji({ name: 'starblue', id: '1524029269490139166' }).setStyle(ButtonStyle.Secondary),
            new ButtonBuilder().setCustomId('rate_3').setLabel('3').setEmoji({ name: 'starblue', id: '1524029269490139166' }).setStyle(ButtonStyle.Secondary),
            new ButtonBuilder().setCustomId('rate_4').setLabel('4').setEmoji({ name: 'starblue', id: '1524029269490139166' }).setStyle(ButtonStyle.Secondary),
            new ButtonBuilder().setCustomId('rate_5').setLabel('5').setEmoji({ name: 'starblue', id: '1524029269490139166' }).setStyle(ButtonStyle.Secondary)
        )
    );

    return container;
}

// ==================== EXCHANGE SYSTEM ====================

const EXCHANGE_BANNER = TICKET_BANNER;
const EXCHANGE_LOGO = TICKET_LOGO;

const SENDING_METHODS = [
    { label: 'Paysafe', value: 'paysafe' },
    { label: 'PayPal', value: 'paypal' },
    { label: 'Crypto', value: 'crypto' },
    { label: 'Revolut', value: 'revolut' },
    { label: 'Bank Transfer', value: 'bank' }
];

const PAYSAFE_TYPES = [
    { label: 'Greek Paysafe', value: 'greek_paysafe' },
    { label: 'German Paysafe', value: 'german_paysafe' },
    { label: 'Spanish Paysafe', value: 'spanish_paysafe' },
    { label: 'French Paysafe', value: 'french_paysafe' }
];

const RECEIVING_METHODS = [
    { label: 'Paysafe', value: 'paysafe' },
    { label: 'PayPal', value: 'paypal' },
    { label: 'Crypto', value: 'crypto' },
    { label: 'Revolut', value: 'revolut' },
    { label: 'Bank Transfer', value: 'bank' }
];

const CURRENCIES = [
    { label: 'EUR (€)', value: 'EUR' },
    { label: 'USD ($)', value: 'USD' },
    { label: 'GBP (£)', value: 'GBP' }
];

const EXCHANGE_FEE_RATE = 0.20;
const EXCHANGE_MIN_FEE = 0.70;

function calcFee(amount) {
    const fee = amount * EXCHANGE_FEE_RATE;
    return Math.max(fee, EXCHANGE_MIN_FEE);
}

function getMethodEmoji(method) {
    const map = { paysafe: '🏦', paypal: '💳', crypto: '₿', revolut: '📱', bank: '🏛️' };
    return map[method] || '';
}

function getCurrencySymbol(currency) {
    const map = { EUR: '€', USD: '$', GBP: '£' };
    return map[currency] || currency;
}

function buildExchangeWelcomePanel() {
    const container = new ContainerBuilder();
    container.setAccentColor(0x9b59b6);

    container.addMediaGalleryComponents(
        new MediaGalleryBuilder().addItems(
            new MediaGalleryItemBuilder().setURL(EXCHANGE_BANNER)
        )
    );

    container.addSeparatorComponents(new SeparatorBuilder());

    container.addTextDisplayComponents(
        new TextDisplayBuilder().setContent('# 🔄 __**Welcome To Velox Exchange**__')
    );

    container.addSeparatorComponents(new SeparatorBuilder());

    container.addTextDisplayComponents(
        new TextDisplayBuilder().setContent(
            'At **Velox Exchange**, we make all kind of trades simple and safe. Whether you\'re just starting out or you have experience in exchanging, we\'ve got you covered. What we offer:'
        )
    );

    container.addTextDisplayComponents(
        new TextDisplayBuilder().setContent(
            '> 💫 **Instant & Secure Service**\n' +
            '> 🔍 **Transparent Middleman System**'
        )
    );

    container.addSeparatorComponents(new SeparatorBuilder());

    container.addTextDisplayComponents(
        new TextDisplayBuilder().setContent(
            'We recommend reviewing our [Terms Of Service](https://discord.com/channels/1523717705130315877/1523723223131488412) and [Fees Documentation](https://discord.com/channels/1523717705130315877/1523723223131488412) to ensure a clear and seamless experience with us.'
        )
    );

    container.addSeparatorComponents(new SeparatorBuilder());

    container.addMediaGalleryComponents(
        new MediaGalleryBuilder().addItems(
            new MediaGalleryItemBuilder().setURL(EXCHANGE_BANNER)
        )
    );

    container.addSeparatorComponents(new SeparatorBuilder());

    container.addActionRowComponents(
        new ActionRowBuilder().addComponents(
            new ButtonBuilder()
                .setCustomId('exchange_start')
                .setLabel('Start A Trade')
                .setStyle(ButtonStyle.Success)
        )
    );

    return container;
}

function buildSendingMethodPanel() {
    const container = new ContainerBuilder();
    container.setAccentColor(0x9b59b6);

    container.addTextDisplayComponents(
        new TextDisplayBuilder().setContent('# 📤 __**Sending Method**__')
    );

    container.addSeparatorComponents(new SeparatorBuilder());

    container.addTextDisplayComponents(
        new TextDisplayBuilder().setContent('> 💫 Please select what you want to **SEND** from the menu below.')
    );

    container.addSeparatorComponents(new SeparatorBuilder());

    const selectMenu = new StringSelectMenuBuilder()
        .setCustomId('exchange_sending_method')
        .setPlaceholder('Select Payment Method')
        .addOptions(
            SENDING_METHODS.map(m => ({
                label: m.label,
                value: m.value
            }))
        );

    container.addActionRowComponents(
        new ActionRowBuilder().addComponents(selectMenu)
    );

    return container;
}

function buildPaysafeTypePanel() {
    const container = new ContainerBuilder();
    container.setAccentColor(0x9b59b6);

    container.addTextDisplayComponents(
        new TextDisplayBuilder().setContent('# 🏦 __**Paysafe Type**__')
    );

    container.addSeparatorComponents(new SeparatorBuilder());

    container.addTextDisplayComponents(
        new TextDisplayBuilder().setContent('> ❌ Select the specific funding region source.')
    );

    container.addSeparatorComponents(new SeparatorBuilder());

    const selectMenu = new StringSelectMenuBuilder()
        .setCustomId('exchange_paysafe_type')
        .setPlaceholder('Select Paysafe Type')
        .addOptions(
            PAYSAFE_TYPES.map(t => ({
                label: t.label,
                value: t.value
            }))
        );

    container.addActionRowComponents(
        new ActionRowBuilder().addComponents(selectMenu)
    );

    return container;
}

function buildReceivingMethodPanel() {
    const container = new ContainerBuilder();
    container.setAccentColor(0x9b59b6);

    container.addTextDisplayComponents(
        new TextDisplayBuilder().setContent('# 📥 __**Receiving Method**__')
    );

    container.addSeparatorComponents(new SeparatorBuilder());

    container.addTextDisplayComponents(
        new TextDisplayBuilder().setContent('> 💫 What do you want to **RECEIVE**?')
    );

    container.addSeparatorComponents(new SeparatorBuilder());

    const selectMenu = new StringSelectMenuBuilder()
        .setCustomId('exchange_receiving_method')
        .setPlaceholder('What will you be receiving?')
        .addOptions(
            RECEIVING_METHODS.map(m => ({
                label: m.label,
                value: m.value
            }))
        );

    container.addActionRowComponents(
        new ActionRowBuilder().addComponents(selectMenu)
    );

    return container;
}

function buildAmountPanel() {
    const container = new ContainerBuilder();
    container.setAccentColor(0x9b59b6);

    container.addTextDisplayComponents(
        new TextDisplayBuilder().setContent('# 💰 __**Enter Amount**__')
    );

    container.addSeparatorComponents(new SeparatorBuilder());

    container.addTextDisplayComponents(
        new TextDisplayBuilder().setContent('> 💫 Choose how you want to enter the amount.')
    );

    container.addSeparatorComponents(new SeparatorBuilder());

    container.addActionRowComponents(
        new ActionRowBuilder().addComponents(
            new ButtonBuilder()
                .setCustomId('exchange_amount_modal')
                .setLabel('Enter Amount (Modal)')
                .setStyle(ButtonStyle.Primary),
            new ButtonBuilder()
                .setCustomId('exchange_amount_keypad')
                .setLabel('Enter Amount (Keypad)')
                .setStyle(ButtonStyle.Secondary)
        )
    );

    return container;
}

function buildKeypadPanel(amount) {
    const container = new ContainerBuilder();
    container.setAccentColor(0x9b59b6);

    container.addTextDisplayComponents(
        new TextDisplayBuilder().setContent('# 💰 __**Enter Amount**__')
    );

    container.addSeparatorComponents(new SeparatorBuilder());

    container.addTextDisplayComponents(
        new TextDisplayBuilder().setContent('> ❌ **Amount:** ' + (amount || '0'))
    );

    container.addSeparatorComponents(new SeparatorBuilder());

    container.addActionRowComponents(
        new ActionRowBuilder().addComponents(
            new ButtonBuilder().setCustomId('kp_1').setLabel('1').setStyle(ButtonStyle.Secondary),
            new ButtonBuilder().setCustomId('kp_2').setLabel('2').setStyle(ButtonStyle.Secondary),
            new ButtonBuilder().setCustomId('kp_3').setLabel('3').setStyle(ButtonStyle.Secondary),
            new ButtonBuilder().setCustomId('kp_back').setLabel('⌫').setStyle(ButtonStyle.Danger)
        )
    );

    container.addActionRowComponents(
        new ActionRowBuilder().addComponents(
            new ButtonBuilder().setCustomId('kp_4').setLabel('4').setStyle(ButtonStyle.Secondary),
            new ButtonBuilder().setCustomId('kp_5').setLabel('5').setStyle(ButtonStyle.Secondary),
            new ButtonBuilder().setCustomId('kp_6').setLabel('6').setStyle(ButtonStyle.Secondary),
            new ButtonBuilder().setCustomId('kp_clear').setLabel('C').setStyle(ButtonStyle.Danger)
        )
    );

    container.addActionRowComponents(
        new ActionRowBuilder().addComponents(
            new ButtonBuilder().setCustomId('kp_7').setLabel('7').setStyle(ButtonStyle.Secondary),
            new ButtonBuilder().setCustomId('kp_8').setLabel('8').setStyle(ButtonStyle.Secondary),
            new ButtonBuilder().setCustomId('kp_9').setLabel('9').setStyle(ButtonStyle.Secondary),
            new ButtonBuilder().setCustomId('kp_dot').setLabel('.').setStyle(ButtonStyle.Secondary)
        )
    );

    container.addActionRowComponents(
        new ActionRowBuilder().addComponents(
            new ButtonBuilder().setCustomId('kp_0').setLabel('0').setStyle(ButtonStyle.Secondary),
            new ButtonBuilder().setCustomId('kp_ok').setLabel('OK').setStyle(ButtonStyle.Success),
            new ButtonBuilder().setCustomId('kp_cancel').setLabel('Cancel').setStyle(ButtonStyle.Danger)
        )
    );

    return container;
}

function buildCurrencyPanel() {
    const container = new ContainerBuilder();
    container.setAccentColor(0x9b59b6);

    container.addTextDisplayComponents(
        new TextDisplayBuilder().setContent('# 💱 __**Select Currency**__')
    );

    container.addSeparatorComponents(new SeparatorBuilder());

    container.addTextDisplayComponents(
        new TextDisplayBuilder().setContent('> 💫 Please select the **CURRENCY** for this transaction.')
    );

    container.addSeparatorComponents(new SeparatorBuilder());

    container.addActionRowComponents(
        new ActionRowBuilder().addComponents(
            new ButtonBuilder().setCustomId('exchange_currency_EUR').setLabel('🇪🇺 EUR (€)').setStyle(ButtonStyle.Secondary),
            new ButtonBuilder().setCustomId('exchange_currency_USD').setLabel('💲 USD ($)').setStyle(ButtonStyle.Secondary),
            new ButtonBuilder().setCustomId('exchange_currency_GBP').setLabel('🇬🇧 GBP (£)').setStyle(ButtonStyle.Secondary)
        )
    );

    return container;
}

function buildTradeSummaryPanel(data) {
    const container = new ContainerBuilder();
    container.setAccentColor(0x9b59b6);

    const fee = calcFee(data.sendAmount);
    const receiveAmount = (data.sendAmount - fee).toFixed(2);
    const sendSymbol = getCurrencySymbol(data.sendCurrency);
    const receiveSymbol = getCurrencySymbol(data.receiveCurrency);

    container.addTextDisplayComponents(
        new TextDisplayBuilder().setContent('# 💰 __**Trade Summary** 💰__')
    );

    container.addSeparatorComponents(new SeparatorBuilder());

    container.addTextDisplayComponents(
        new TextDisplayBuilder().setContent('## 📤 __**From**__')
    );

    container.addTextDisplayComponents(
        new TextDisplayBuilder().setContent(
            '> **Method:** ' + getMethodEmoji(data.sendMethod) + ' ' + data.sendMethod.charAt(0).toUpperCase() + data.sendMethod.slice(1) + '\n' +
            '> **Sending Amount:** ' + data.sendAmount.toFixed(2) + sendSymbol
        )
    );

    container.addSeparatorComponents(new SeparatorBuilder());

    container.addTextDisplayComponents(
        new TextDisplayBuilder().setContent('## 📥 __**To**__')
    );

    container.addTextDisplayComponents(
        new TextDisplayBuilder().setContent(
            '> **Method:** ' + getMethodEmoji(data.receiveMethod) + ' ' + data.receiveMethod.charAt(0).toUpperCase() + data.receiveMethod.slice(1) + '\n' +
            '> **Receiving Amount:** ' + receiveAmount + receiveSymbol
        )
    );

    container.addSeparatorComponents(new SeparatorBuilder());

    container.addTextDisplayComponents(
        new TextDisplayBuilder().setContent('💸 **Fee Deducted:** ' + fee.toFixed(2) + sendSymbol + ' (Min Fee ' + EXCHANGE_MIN_FEE.toFixed(2) + sendSymbol + ')')
    );

    container.addSeparatorComponents(new SeparatorBuilder());

    container.addTextDisplayComponents(
        new TextDisplayBuilder().setContent(
            '⚠️ By clicking the confirm button, you are agreeing with all the [Terms Of Service](https://discord.com/channels/1523717705130315877/1523723223131488412) of our server.'
        )
    );

    container.addSeparatorComponents(new SeparatorBuilder());

    container.addActionRowComponents(
        new ActionRowBuilder().addComponents(
            new ButtonBuilder()
                .setCustomId('exchange_confirm')
                .setLabel('Confirm & Create Ticket')
                .setStyle(ButtonStyle.Success),
            new ButtonBuilder()
                .setCustomId('exchange_add_note')
                .setLabel('Add Note')
                .setStyle(ButtonStyle.Primary),
            new ButtonBuilder()
                .setCustomId('exchange_cancel')
                .setLabel('Cancel Process')
                .setStyle(ButtonStyle.Danger)
        )
    );

    return container;
}

function buildExchangeTicketContainer(data, user) {
    const container = new ContainerBuilder();
    container.setAccentColor(0x9b59b6);

    const fee = calcFee(data.sendAmount);
    const receiveAmount = (data.sendAmount - fee).toFixed(2);
    const sendSymbol = getCurrencySymbol(data.sendCurrency);
    const receiveSymbol = getCurrencySymbol(data.receiveCurrency);
    const ticketId = 'VEX-' + Math.random().toString(36).substr(2, 6).toUpperCase();

    container.addMediaGalleryComponents(
        new MediaGalleryBuilder().addItems(
            new MediaGalleryItemBuilder().setURL(EXCHANGE_BANNER)
        )
    );

    container.addSeparatorComponents(new SeparatorBuilder());

    container.addSectionComponents(
        new SectionBuilder()
            .addTextDisplayComponents(
                new TextDisplayBuilder().setContent('# 🤝 __**Welcome to your Ticket!**__')
            )
            .setThumbnailAccessory(
                new ThumbnailBuilder().setURL(EXCHANGE_LOGO)
            )
    );

    container.addTextDisplayComponents(
        new TextDisplayBuilder().setContent('**Customer:** <@' + user.id + '>')
    );
    container.addTextDisplayComponents(
        new TextDisplayBuilder().setContent('**Badge:** None')
    );

    container.addSeparatorComponents(new SeparatorBuilder());

    container.addTextDisplayComponents(
        new TextDisplayBuilder().setContent('## 📋 __**Ticket Status & Rules**__')
    );

    container.addTextDisplayComponents(
        new TextDisplayBuilder().setContent(
            '> ⏰ **Expiration:** This ticket closes automatically in **3 hours** if unclaimed.\n' +
            '> 🔔 **Bump:** You can notify traders again in **30 minutes**.\n' +
            '> ⚠️ **Important:** When your ticket gets claimed, make sure to read the trader\'s ToS.'
        )
    );

    container.addSeparatorComponents(new SeparatorBuilder());

    container.addTextDisplayComponents(
        new TextDisplayBuilder().setContent('## 📤 __**Customer Sending**__')
    );
    container.addTextDisplayComponents(
        new TextDisplayBuilder().setContent(
            '> **Method:** ' + getMethodEmoji(data.sendMethod) + ' ' + data.sendMethod.charAt(0).toUpperCase() + data.sendMethod.slice(1) + '\n' +
            '> **Sending Amount:** ' + data.sendAmount.toFixed(2) + sendSymbol
        )
    );

    container.addSeparatorComponents(new SeparatorBuilder());

    container.addTextDisplayComponents(
        new TextDisplayBuilder().setContent('## 📥 __**Customer Receiving**__')
    );
    container.addTextDisplayComponents(
        new TextDisplayBuilder().setContent(
            '> **Method:** ' + getMethodEmoji(data.receiveMethod) + ' ' + data.receiveMethod.charAt(0).toUpperCase() + data.receiveMethod.slice(1) + '\n' +
            '> **Receiving Amount:** ' + receiveAmount + receiveSymbol
        )
    );

    container.addSeparatorComponents(new SeparatorBuilder());

    container.addTextDisplayComponents(
        new TextDisplayBuilder().setContent('💸 **Fee Deducted:** ' + fee.toFixed(2) + sendSymbol + ' (Min Fee ' + EXCHANGE_MIN_FEE.toFixed(2) + sendSymbol + ')')
    );

    container.addTextDisplayComponents(
        new TextDisplayBuilder().setContent('🆔 **Ticket ID:** `' + ticketId + '`')
    );

    container.addSeparatorComponents(new SeparatorBuilder());

    container.addActionRowComponents(
        new ActionRowBuilder().addComponents(
            new ButtonBuilder()
                .setCustomId('exchange_ticket_close')
                .setLabel('Close Ticket')
                .setEmoji({ name: 'close', id: '1514086733757681715' })
                .setStyle(ButtonStyle.Danger),
            new ButtonBuilder()
                .setCustomId('exchange_ticket_notify')
                .setLabel('Notify Again')
                .setStyle(ButtonStyle.Secondary),
            new ButtonBuilder()
                .setCustomId('exchange_ticket_change_amount')
                .setLabel('Change Amount')
                .setStyle(ButtonStyle.Primary),
            new ButtonBuilder()
                .setCustomId('exchange_ticket_change_currency')
                .setLabel('Change Currency')
                .setStyle(ButtonStyle.Primary)
        )
    );

    return container;
}

function buildExchangeClosingPanel() {
    const container = new ContainerBuilder();
    container.setAccentColor(0xff0000);

    container.addTextDisplayComponents(
        new TextDisplayBuilder().setContent('> ⚠️ **Ticket Closing... Saving Transcript...**')
    );

    return container;
}

function buildTradeCompletedPanel(data) {
    const container = new ContainerBuilder();
    container.setAccentColor(0x2ecc71);

    const fee = calcFee(data.sendAmount);
    const receiveAmount = (data.sendAmount - fee).toFixed(2);
    const sendSymbol = getCurrencySymbol(data.sendCurrency);
    const receiveSymbol = getCurrencySymbol(data.receiveCurrency);

    const timeAgo = 'Just now';

    container.addTextDisplayComponents(
        new TextDisplayBuilder().setContent('# ✅ __**Trade Completed**__')
    );

    container.addSeparatorComponents(new SeparatorBuilder());

    container.addTextDisplayComponents(
        new TextDisplayBuilder().setContent('## 📤 __**Customer Sent**__')
    );
    container.addTextDisplayComponents(
        new TextDisplayBuilder().setContent(
            '> **Method:** ' + getMethodEmoji(data.sendMethod) + ' ' + data.sendMethod.charAt(0).toUpperCase() + data.sendMethod.slice(1) + '\n' +
            '> **Sent Amount:** ' + data.sendAmount.toFixed(2) + sendSymbol
        )
    );

    container.addSeparatorComponents(new SeparatorBuilder());

    container.addTextDisplayComponents(
        new TextDisplayBuilder().setContent('## 📥 __**Customer Received**__')
    );
    container.addTextDisplayComponents(
        new TextDisplayBuilder().setContent(
            '> **Method:** ' + getMethodEmoji(data.receiveMethod) + ' ' + data.receiveMethod.charAt(0).toUpperCase() + data.receiveMethod.slice(1) + '\n' +
            '> **Received Amount:** ' + receiveAmount + receiveSymbol
        )
    );

    container.addSeparatorComponents(new SeparatorBuilder());

    container.addTextDisplayComponents(
        new TextDisplayBuilder().setContent('🆔 **Ticket ID:** `' + ('VEX-' + Math.random().toString(36).substr(2, 6).toUpperCase()) + '`')
    );

    container.addTextDisplayComponents(
        new TextDisplayBuilder().setContent('🕐 Completed ' + timeAgo)
    );

    return container;
}

// ==================== CREATE TICKET CHANNEL ====================

async function createTicketChannel(guild, user, container, info = null) {
    const channelName = ('ticket-' + user.username).toLowerCase().replace(/\s+/g, '-').slice(0, 100);

    const ticketChannel = await guild.channels.create({
        name: channelName,
        type: ChannelType.GuildText,
        permissionOverwrites: [
            { id: guild.id, deny: [PermissionFlagsBits.ViewChannel] },
            {
                id: user.id,
                allow: [
                    PermissionFlagsBits.ViewChannel,
                    PermissionFlagsBits.SendMessages,
                    PermissionFlagsBits.ReadMessageHistory
                ]
            },
            {
                id: client.user.id,
                allow: [
                    PermissionFlagsBits.ViewChannel,
                    PermissionFlagsBits.SendMessages,
                    PermissionFlagsBits.ReadMessageHistory,
                    PermissionFlagsBits.ManageChannels
                ]
            }
        ]
    });

    if (info) {
        ticketInfo.set(ticketChannel.id, info);
    }

    await ticketChannel.send({
        content: '<@' + user.id + '>',
        allowedMentions: { users: [user.id] }
    });
    await ticketChannel.send(v2Message(container));

    return ticketChannel;
}

// ==================== BOT ====================

let statusMessage = null;
let autoRoleEnabled = true;
const captchas = new Map();

client.once('ready', () => {
    console.log(`✅ Logged in as ${client.user.tag}`);
    console.log(`📡 Serving ${client.guilds.cache.size} guilds`);
    client.user.setPresence({
        status: 'dnd',
        activities: [{ name: 'Velox Bots', type: 3 }]
    });
});

async function updateStatusMessage() {
    if (!statusMessage) return;
    try {
        const channel = client.channels.cache.get(statusMessage.channelId);
        if (!channel) return;
        const message = await channel.messages.fetch(statusMessage.messageId);
        if (!message) return;
        await message.edit(v2Message(buildStatusPanel(message.guild, client)));
    } catch (e) {}
}

client.on('guildMemberAdd', async (member) => {
    updateStatusMessage();
    if (autoRoleEnabled) {
        try {
            await member.roles.add('1523724569528107179');
        } catch (e) {}
    }
    try {
        const logChannel = member.guild.channels.cache.get('1523725847754702919');
        if (!logChannel) return;

        const container = new ContainerBuilder();
        container.setAccentColor(0x00ff00);

        container.addMediaGalleryComponents(
            new MediaGalleryBuilder().addItems(
                new MediaGalleryItemBuilder().setURL(TICKET_BANNER)
            )
        );

        container.addSeparatorComponents(new SeparatorBuilder());

        container.addSectionComponents(
            new SectionBuilder()
                .addTextDisplayComponents(
                    new TextDisplayBuilder().setContent('# <:velox:1523718046546530365> __**Welcome!**__')
                )
                .setThumbnailAccessory(
                    new ThumbnailBuilder().setURL(TICKET_LOGO)
                )
        );

        container.addSeparatorComponents(new SeparatorBuilder());

        container.addTextDisplayComponents(
            new TextDisplayBuilder().setContent(
                'Welcome to **' + member.guild.name + '**, <@' + member.id + '>!\n\n' +
                'You are member **#' + member.guild.memberCount + '**\n' +
                'Enjoy your stay and check out our rules!'
            )
        );

        await logChannel.send(v2Message(container));
    } catch (e) {}
});

client.on('guildMemberRemove', async (member) => {
    updateStatusMessage();
    try {
        const logChannel = member.guild.channels.cache.get('1523725891484651680');
        if (!logChannel) return;

        const container = new ContainerBuilder();
        container.setAccentColor(0xff0000);

        container.addMediaGalleryComponents(
            new MediaGalleryBuilder().addItems(
                new MediaGalleryItemBuilder().setURL(TICKET_BANNER)
            )
        );

        container.addSeparatorComponents(new SeparatorBuilder());

        container.addSectionComponents(
            new SectionBuilder()
                .addTextDisplayComponents(
                    new TextDisplayBuilder().setContent('# <:velox:1523718046546530365> __**Goodbye!**__')
                )
                .setThumbnailAccessory(
                    new ThumbnailBuilder().setURL(TICKET_LOGO)
                )
        );

        container.addSeparatorComponents(new SeparatorBuilder());

        container.addTextDisplayComponents(
            new TextDisplayBuilder().setContent(
                '**' + member.user.tag + '** has left **' + member.guild.name + '**.\n\n' +
                'We now have **' + member.guild.memberCount + '** members.'
            )
        );

        await logChannel.send(v2Message(container));
    } catch (e) {}
});

client.on('interactionCreate', async interaction => {

    if (interaction.isChatInputCommand()) {
        if (interaction.commandName === 'ticket') {
            if (!interaction.member.permissions.has(PermissionFlagsBits.Administrator)) {
                return interaction.reply({ content: '❌ You need Administrator permission.', ephemeral: true });
            }
            await interaction.reply(v2Message(buildTicketPanel()));
        }

        if (interaction.commandName === 'ticketbot') {
            if (!interaction.member.permissions.has(PermissionFlagsBits.Administrator)) {
                return interaction.reply({ content: '❌ You need Administrator permission.', ephemeral: true });
            }
            await interaction.reply(v2Message(buildBotPanel()));
        }

        if (interaction.commandName === 'tos') {
            if (!interaction.member.permissions.has(PermissionFlagsBits.Administrator)) {
                return interaction.reply({ content: '❌ You need Administrator permission.', ephemeral: true });
            }
            await interaction.reply(v2Message(buildTOSPanel()));
        }

        if (interaction.commandName === 'status') {
            await interaction.reply(v2Message(buildStatusPanel(interaction.guild, client)));
            const msg = await interaction.fetchReply();
            statusMessage = { channelId: interaction.channelId, messageId: msg.id };
        }

        if (interaction.commandName === 'autorole') {
            if (!interaction.member.permissions.has(PermissionFlagsBits.Administrator)) {
                return interaction.reply({ content: '❌ You need Administrator permission.', ephemeral: true });
            }
            autoRoleEnabled = !autoRoleEnabled;
            const state = autoRoleEnabled ? '✅ Enabled' : '❌ Disabled';
            await interaction.reply({ content: state + ' — Auto-role is now **' + (autoRoleEnabled ? 'ON' : 'OFF') + '**', flags: 64 });
        }

        if (interaction.commandName === 'test') {
            if (!interaction.member.permissions.has(PermissionFlagsBits.Administrator)) {
                return interaction.reply({ content: '❌ You need Administrator permission.', ephemeral: true });
            }
            const logChannel = interaction.guild.channels.cache.get('1523725847754702919');
            if (!logChannel) return interaction.reply({ content: '❌ Log channel not found.', flags: 64 });

            const container = new ContainerBuilder();
            container.setAccentColor(0x00ff00);

            container.addMediaGalleryComponents(
                new MediaGalleryBuilder().addItems(
                    new MediaGalleryItemBuilder().setURL(TICKET_BANNER)
                )
            );

            container.addSeparatorComponents(new SeparatorBuilder());

            container.addSectionComponents(
                new SectionBuilder()
                    .addTextDisplayComponents(
                        new TextDisplayBuilder().setContent('# <:velox:1523718046546530365> __**Welcome!**__')
                    )
                    .setThumbnailAccessory(
                        new ThumbnailBuilder().setURL(TICKET_LOGO)
                    )
            );

            container.addSeparatorComponents(new SeparatorBuilder());

            container.addTextDisplayComponents(
                new TextDisplayBuilder().setContent(
                    'Welcome to **' + interaction.guild.name + '**, <@' + interaction.user.id + '>!\n\n' +
                    'You are member **#' + interaction.guild.memberCount + '**\n' +
                    'Enjoy your stay and check out our rules!'
                )
            );

            await logChannel.send(v2Message(container));
            await interaction.reply({ content: '✅ Test welcome message sent to <#1523725847754702919>', flags: 64 });
        }

        if (interaction.commandName === 'verify') {
            if (!interaction.member.permissions.has(PermissionFlagsBits.Administrator)) {
                return interaction.reply({ content: '❌ You need Administrator permission.', ephemeral: true });
            }
            await interaction.reply(v2Message(buildVerifyPanel()));
        }

        if (interaction.commandName === 'exchangesetup') {
            if (!interaction.member.permissions.has(PermissionFlagsBits.Administrator)) {
                return interaction.reply({ content: '❌ You need Administrator permission.', ephemeral: true });
            }
            await interaction.reply(v2Message(buildExchangeWelcomePanel()));
        }
    }

    if (interaction.isStringSelectMenu()) {
        if (interaction.customId === 'ticket_select') {
            const subject = interaction.values[0];
            const guild = interaction.guild;
            const user = interaction.user;

            await interaction.deferReply({ flags: 64 });

            const ticketChannel = await createTicketChannel(guild, user, buildTicketContainer(subject, user), { type: 'Support', category: getSubjectLabel(subject) });

            await interaction.editReply({
                content: '✅ Ticket created: <#' + ticketChannel.id + '>'
            });
        }

        if (interaction.customId === 'exchange_sending_method') {
            const method = interaction.values[0];
            const data = exchangeData.get(interaction.user.id) || {};
            data.sendMethod = method;
            exchangeData.set(interaction.user.id, data);
            await interaction.deferUpdate();
            if (method === 'paysafe') {
                await interaction.editReply(v2Message(buildPaysafeTypePanel()));
            } else {
                await interaction.editReply(v2Message(buildReceivingMethodPanel()));
            }
        }

        if (interaction.customId === 'exchange_paysafe_type') {
            const paysafeType = interaction.values[0];
            const data = exchangeData.get(interaction.user.id) || {};
            data.sendPaysafeType = paysafeType;
            exchangeData.set(interaction.user.id, data);
            await interaction.deferUpdate();
            await interaction.editReply(v2Message(buildReceivingMethodPanel()));
        }

        if (interaction.customId === 'exchange_receiving_method') {
            const method = interaction.values[0];
            const data = exchangeData.get(interaction.user.id) || {};
            data.receiveMethod = method;
            exchangeData.set(interaction.user.id, data);
            await interaction.deferUpdate();
            await interaction.editReply(v2Message(buildAmountPanel()));
        }
    }

    if (interaction.isButton()) {
        // ==================== CUSTOM BOT FLOW ====================
        if (interaction.customId === 'custom_bot') {
            await interaction.deferReply({ flags: 64 });
            userSelections.set(interaction.user.id, { botType: 'Custom Bot for Server' });
            await interaction.editReply(v2Message(buildDurationPanel('Custom Bot for Server')));
        }

        if (interaction.customId === 'security_bot') {
            await interaction.deferReply({ flags: 64 });
            userSelections.set(interaction.user.id, { botType: 'Security Bot' });
            await interaction.editReply(v2Message(buildDurationPanel('Security Bot')));
        }

        if (interaction.customId === 'tos_open') {
            await interaction.deferReply({ flags: 64 });
            await interaction.editReply(v2Message(buildTOSContent()));
        }

        if (interaction.customId === 'tos_back') {
            await interaction.deferReply({ flags: 64 });
            await interaction.editReply(v2Message(buildTOSPanel()));
        }

        if (interaction.customId === 'verify_start') {
            const captcha = generateCaptcha();
            captchas.set(interaction.user.id, captcha.answer);

            const modal = new ModalBuilder()
                .setCustomId('verify_modal')
                .setTitle('Captcha Verification');

            const captchaInput = new TextInputBuilder()
                .setCustomId('captcha_answer')
                .setLabel('What is ' + captcha.question + '?')
                .setStyle(TextInputStyle.Short)
                .setRequired(true);

            modal.addComponents(new ActionRowBuilder().addComponents(captchaInput));
            await interaction.showModal(modal);
        }

        if (interaction.customId.startsWith('bottype_')) {
            const botType = interaction.customId === 'bottype_server' ? 'Custom Bot for Server' : 'Security Bot';
            userSelections.set(interaction.user.id, { botType });
            await interaction.deferUpdate();
            await interaction.editReply(v2Message(buildDurationPanel(botType)));
        }

        if (interaction.customId.startsWith('duration_')) {
            const duration = interaction.customId.replace('duration_', '').charAt(0).toUpperCase() + interaction.customId.replace('duration_', '').slice(1);
            const data = userSelections.get(interaction.user.id);
            userSelections.set(interaction.user.id, { ...data, duration });
            await interaction.deferUpdate();
            await interaction.editReply(v2Message(buildPaymentPanel(duration)));
        }

        if (interaction.customId === 'pay_paysafe') {
            const data = userSelections.get(interaction.user.id);
            await interaction.deferUpdate();
            await interaction.editReply(v2Message(buildPaysafePanel(data.duration)));
        }

        if (interaction.customId === 'pay_crypto') {
            const data = userSelections.get(interaction.user.id);
            await interaction.deferUpdate();
            await interaction.editReply(v2Message(buildCryptoPanel(data.duration)));
        }

        if (interaction.customId === 'pay_paypal') {
            const data = userSelections.get(interaction.user.id);
            userSelections.delete(interaction.user.id);

            await interaction.deferUpdate();
            await interaction.message.delete().catch(() => {});

            const ticketChannel = await createTicketChannel(interaction.guild, interaction.user, buildBotTicketContainer(data.botType, data.duration, 'PayPal', null, interaction.user), { type: data.botType, duration: data.duration, payment: 'PayPal' });

            await interaction.followUp({
                content: '✅ Ticket created: <#' + ticketChannel.id + '>',
                flags: 64
            });
        }

        if (interaction.customId.startsWith('paysafe_')) {
            const paysafeType = interaction.customId === 'paysafe_greek' ? 'Greek Paysafe' : 'German Paysafe';
            const data = userSelections.get(interaction.user.id);
            userSelections.delete(interaction.user.id);

            await interaction.deferUpdate();
            await interaction.message.delete().catch(() => {});

            const ticketChannel = await createTicketChannel(interaction.guild, interaction.user, buildBotTicketContainer(data.botType, data.duration, 'Paysafe', paysafeType, interaction.user), { type: data.botType, duration: data.duration, payment: 'Paysafe', paysafeType });

            await interaction.followUp({
                content: '✅ Ticket created: <#' + ticketChannel.id + '>',
                flags: 64
            });
        }

        if (interaction.customId.startsWith('crypto_')) {
            const cryptoMap = {
                crypto_ltc: 'LTC',
                crypto_btc: 'Bitcoin',
                crypto_sol: 'Solana',
                crypto_eth: 'Ethereum'
            };
            const crypto = cryptoMap[interaction.customId];
            const data = userSelections.get(interaction.user.id);
            userSelections.delete(interaction.user.id);

            await interaction.deferUpdate();
            await interaction.message.delete().catch(() => {});

            const ticketChannel = await createTicketChannel(interaction.guild, interaction.user, buildBotTicketContainer(data.botType, data.duration, 'Crypto', crypto, interaction.user), { type: data.botType, duration: data.duration, payment: 'Crypto', crypto });

            await interaction.followUp({
                content: '✅ Ticket created: <#' + ticketChannel.id + '>',
                flags: 64
            });
        }

        // ==================== EXCHANGE FLOW ====================
        if (interaction.customId === 'exchange_start') {
            await interaction.deferReply({ flags: 64 });
            exchangeData.set(interaction.user.id, {});
            await interaction.editReply(v2Message(buildSendingMethodPanel()));
        }

        if (interaction.customId === 'exchange_amount_modal') {
            const modal = new ModalBuilder()
                .setCustomId('exchange_amount_modal_submit')
                .setTitle('Enter Amount');
            const amountInput = new TextInputBuilder()
                .setCustomId('exchange_amount_input')
                .setLabel('Amount')
                .setStyle(TextInputStyle.Short)
                .setPlaceholder('Enter the amount...')
                .setRequired(true);
            modal.addComponents(new ActionRowBuilder().addComponents(amountInput));
            await interaction.showModal(modal);
        }

        if (interaction.customId === 'exchange_amount_keypad') {
            const data = exchangeData.get(interaction.user.id) || {};
            data.keypadAmount = '';
            exchangeData.set(interaction.user.id, data);
            await interaction.deferUpdate();
            await interaction.editReply(v2Message(buildKeypadPanel('')));
        }

        if (interaction.customId.startsWith('kp_')) {
            const data = exchangeData.get(interaction.user.id) || {};
            let amount = data.keypadAmount || '';

            if (interaction.customId === 'kp_cancel') {
                exchangeData.delete(interaction.user.id);
                await interaction.deferUpdate();
                await interaction.message.delete().catch(() => {});
                return;
            }

            if (interaction.customId === 'kp_ok') {
                if (!amount || isNaN(parseFloat(amount))) {
                    return interaction.reply({ content: '❌ Please enter a valid amount.', flags: 64 });
                }
                data.sendAmount = parseFloat(amount);
                delete data.keypadAmount;
                exchangeData.set(interaction.user.id, data);
                await interaction.deferUpdate();
                await interaction.editReply(v2Message(buildCurrencyPanel()));
                return;
            }

            if (interaction.customId === 'kp_back') {
                amount = amount.slice(0, -1);
            } else if (interaction.customId === 'kp_clear') {
                amount = '';
            } else if (interaction.customId === 'kp_dot') {
                if (!amount.includes('.')) amount += amount ? '.' : '0.';
            } else {
                const digit = interaction.customId.replace('kp_', '');
                amount += digit;
            }

            data.keypadAmount = amount;
            exchangeData.set(interaction.user.id, data);
            await interaction.deferUpdate();
            await interaction.editReply(v2Message(buildKeypadPanel(amount)));
        }

        if (interaction.customId.startsWith('exchange_currency_')) {
            const currency = interaction.customId.replace('exchange_currency_', '');

            const ticketData = exchangeTickets.get(interaction.channel.id);
            if (ticketData) {
                ticketData.sendCurrency = currency;
                ticketData.receiveCurrency = currency;
                exchangeTickets.set(interaction.channel.id, ticketData);

                const messages = await interaction.channel.messages.fetch({ limit: 10 });
                const ticketMsg = messages.find(m => m.author.id === client.user.id && m.components.length > 0);
                if (ticketMsg) {
                    await ticketMsg.edit(v2Message(buildExchangeTicketContainer(ticketData, ticketData.user)));
                }

                await interaction.reply({ content: '✅ Currency updated to: **' + currency + '**', flags: 64 });
            } else {
                const data = exchangeData.get(interaction.user.id) || {};
                data.sendCurrency = currency;
                data.receiveCurrency = currency;
                exchangeData.set(interaction.user.id, data);
                await interaction.deferUpdate();
                await interaction.editReply(v2Message(buildTradeSummaryPanel(data)));
            }
        }

        if (interaction.customId === 'exchange_add_note') {
            const modal = new ModalBuilder()
                .setCustomId('exchange_note_modal')
                .setTitle('Add Note');
            const noteInput = new TextInputBuilder()
                .setCustomId('exchange_note_text')
                .setLabel('Note')
                .setStyle(TextInputStyle.Paragraph)
                .setPlaceholder('Add any additional notes...')
                .setRequired(false);
            modal.addComponents(new ActionRowBuilder().addComponents(noteInput));
            await interaction.showModal(modal);
        }

        if (interaction.customId === 'exchange_confirm') {
            const data = exchangeData.get(interaction.user.id);
            if (!data) return interaction.reply({ content: '❌ No trade data found.', flags: 64 });

            await interaction.deferReply({ flags: 64 });

            const ticketChannel = await createTicketChannel(
                interaction.guild,
                interaction.user,
                buildExchangeTicketContainer(data, interaction.user),
                { type: 'Exchange', sendMethod: data.sendMethod, receiveMethod: data.receiveMethod, sendAmount: data.sendAmount, sendCurrency: data.sendCurrency, receiveCurrency: data.receiveCurrency }
            );

            exchangeTickets.set(ticketChannel.id, { ...data, user: interaction.user });
            exchangeData.delete(interaction.user.id);
            await interaction.editReply({ content: '✅ Exchange ticket created: <#' + ticketChannel.id + '>' });
        }

        if (interaction.customId === 'exchange_cancel') {
            exchangeData.delete(interaction.user.id);
            await interaction.deferUpdate();
            await interaction.message.delete().catch(() => {});
        }

        if (interaction.customId === 'exchange_ticket_close') {
            if (!interaction.member.permissions.has(PermissionFlagsBits.ManageChannels) && !interaction.member.permissions.has(PermissionFlagsBits.Administrator)) {
                return interaction.reply({ content: '❌ Only staff can close tickets.', ephemeral: true });
            }

            const ticketData = exchangeTickets.get(interaction.channel.id);
            const historyChannel = interaction.guild.channels.cache.get(EXCHANGE_HISTORY_CHANNEL_ID);

            if (ticketData && historyChannel) {
                await historyChannel.send(v2Message(buildTradeCompletedPanel(ticketData)));
            }

            await interaction.reply(v2Message(buildExchangeClosingPanel()));
            exchangeTickets.delete(interaction.channel.id);
            setTimeout(async () => {
                await interaction.channel.delete().catch(() => {});
            }, 3000);
        }

        if (interaction.customId === 'exchange_ticket_notify') {
            await interaction.reply({ content: '🔔 <@' + interaction.user.id + '> bumped the ticket!', flags: 64 });
        }

        if (interaction.customId === 'exchange_ticket_change_amount') {
            const modal = new ModalBuilder()
                .setCustomId('exchange_change_amount_modal')
                .setTitle('Change Amount');
            const amountInput = new TextInputBuilder()
                .setCustomId('new_amount_input')
                .setLabel('New Amount')
                .setStyle(TextInputStyle.Short)
                .setPlaceholder('Enter new amount...')
                .setRequired(true);
            modal.addComponents(new ActionRowBuilder().addComponents(amountInput));
            await interaction.showModal(modal);
        }

        if (interaction.customId === 'exchange_ticket_change_currency') {
            await interaction.reply({ content: '💱 Select a new currency:', components: [
                new ActionRowBuilder().addComponents(
                    new ButtonBuilder().setCustomId('exchange_currency_EUR').setLabel('🇪🇺 EUR (€)').setStyle(ButtonStyle.Secondary),
                    new ButtonBuilder().setCustomId('exchange_currency_USD').setLabel('💲 USD ($)').setStyle(ButtonStyle.Secondary),
                    new ButtonBuilder().setCustomId('exchange_currency_GBP').setLabel('🇬🇧 GBP (£)').setStyle(ButtonStyle.Secondary)
                )
            ], flags: 64 });
        }

        // ==================== TICKET CLOSE & RATE ====================
        if (interaction.customId === 'ticket_close') {
            if (!interaction.member.permissions.has(PermissionFlagsBits.ManageChannels) && !interaction.member.permissions.has(PermissionFlagsBits.Administrator)) {
                return interaction.reply({ content: '❌ Only staff can close tickets.', ephemeral: true });
            }
            await interaction.reply(v2Message(buildRatePanel()));
        }

        if (interaction.customId.startsWith('rate_')) {
            const rating = interaction.customId.split('_')[1];
            pendingRatings.set(interaction.user.id, { rating, channelId: interaction.channel.id });
            const modal = new ModalBuilder()
                .setCustomId('review_modal')
                .setTitle('Write Your Review');
            const reviewInput = new TextInputBuilder()
                .setCustomId('review_text')
                .setLabel('Your review')
                .setStyle(TextInputStyle.Paragraph)
                .setPlaceholder('Tell us about your experience...')
                .setRequired(true)
                .setMinLength(5)
                .setMaxLength(500);
            modal.addComponents(new ActionRowBuilder().addComponents(reviewInput));
            await interaction.showModal(modal);
        }

        // ==================== CLAIM ====================
        if (interaction.customId === 'ticket_claim') {
            if (!interaction.member.roles.cache.has('1523718081866633286')) {
                return interaction.reply({ content: '❌ You do not have permission to claim this ticket.', ephemeral: true });
            }
            await interaction.reply({
                content: '✅ <@' + interaction.member.user.id + '> claimed this ticket!',
                flags: 64
            });
        }
    }

    if (interaction.isModalSubmit()) {
        if (interaction.customId === 'verify_modal') {
            const answer = interaction.fields.getTextInputValue('captcha_answer').trim();
            const correct = captchas.get(interaction.user.id);

            if (answer === correct) {
                try {
                    await interaction.member.roles.add('1523724569528107179');
                    await interaction.member.roles.remove('1524185788101955735');
                    await interaction.reply({ content: '✅ Verification successful! You now have access to the server.', flags: 64 });
                } catch (e) {
                    await interaction.reply({ content: '❌ Failed to assign role.', flags: 64 });
                }
            } else {
                await interaction.reply({ content: '❌ Wrong answer! Click the button again to try.', flags: 64 });
            }
            captchas.delete(interaction.user.id);
        }

        if (interaction.customId === 'review_modal') {
            const reviewText = interaction.fields.getTextInputValue('review_text');
            const pending = pendingRatings.get(interaction.user.id);
            if (!pending) return interaction.reply({ content: '❌ No pending rating found.', flags: 64 });

            const { rating, channelId } = pending;
            const stars = '⭐'.repeat(parseInt(rating));
            const guild = interaction.guild;
            const ratingsChannel = guild.channels.cache.get(RATINGS_CHANNEL_ID);
            const channel = guild.channels.cache.get(channelId);
            const date = new Date().toLocaleDateString('en-US', { month: 'numeric', day: 'numeric', year: 'numeric' }) + ' ' + new Date().toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' });

            await interaction.reply({ content: '✅ Thank you for your review!', flags: 64 });

            if (ratingsChannel) {
                const logContainer = new ContainerBuilder();
                logContainer.setAccentColor(0x2b2d31);
                logContainer.addSectionComponents(
                    new SectionBuilder()
                        .addTextDisplayComponents(
                            new TextDisplayBuilder().setContent('# <:velox:1523718046546530365> __**Velox Bots**__')
                        )
                        .setThumbnailAccessory(
                            new ThumbnailBuilder().setURL(TICKET_LOGO)
                        )
                );
                logContainer.addSeparatorComponents(new SeparatorBuilder());
                logContainer.addTextDisplayComponents(
                    new TextDisplayBuilder().setContent('> ' + reviewText + '\n> **Βαθμολογία:** ' + stars)
                );
                logContainer.addSeparatorComponents(new SeparatorBuilder());
                logContainer.addTextDisplayComponents(
                    new TextDisplayBuilder().setContent('.<@' + interaction.user.id + '> • ' + date)
                );
                await ratingsChannel.send(v2Message(logContainer));
            }

            pendingRatings.delete(interaction.user.id);
            ticketInfo.delete(channelId);

            setTimeout(async () => {
                if (channel) await channel.delete().catch(() => {});
            }, 3000);
        }
        if (interaction.customId === 'exchange_amount_modal_submit') {
            const amount = interaction.fields.getTextInputValue('exchange_amount_input');
            if (isNaN(parseFloat(amount))) {
                return interaction.reply({ content: '❌ Please enter a valid number.', flags: 64 });
            }
            const data = exchangeData.get(interaction.user.id) || {};
            data.sendAmount = parseFloat(amount);
            exchangeData.set(interaction.user.id, data);
            await interaction.reply({ content: '✅ Amount set: **' + amount + '**', flags: 64 });
        }

        if (interaction.customId === 'exchange_note_modal') {
            const note = interaction.fields.getTextInputValue('exchange_note_text');
            const data = exchangeData.get(interaction.user.id) || {};
            data.note = note;
            exchangeData.set(interaction.user.id, data);
            await interaction.reply({ content: '✅ Note added: ' + note, flags: 64 });
        }

        if (interaction.customId === 'exchange_change_amount_modal') {
            const newAmount = interaction.fields.getTextInputValue('new_amount_input');
            if (isNaN(parseFloat(newAmount))) {
                return interaction.reply({ content: '❌ Please enter a valid number.', flags: 64 });
            }

            const ticketData = exchangeTickets.get(interaction.channel.id);
            if (!ticketData) {
                return interaction.reply({ content: '❌ No exchange ticket data found.', flags: 64 });
            }

            ticketData.sendAmount = parseFloat(newAmount);
            exchangeTickets.set(interaction.channel.id, ticketData);

            const messages = await interaction.channel.messages.fetch({ limit: 10 });
            const ticketMsg = messages.find(m => m.author.id === client.user.id && m.components.length > 0);
            if (ticketMsg) {
                await ticketMsg.edit(v2Message(buildExchangeTicketContainer(ticketData, ticketData.user)));
            }

            await interaction.reply({ content: '✅ Amount updated to: **' + newAmount + getCurrencySymbol(ticketData.sendCurrency) + '**', flags: 64 });
        }
    }
});

console.log('🔑 Token exists:', !!process.env.TOKEN);
console.log('🔑 Token length:', process.env.TOKEN ? process.env.TOKEN.trim().length : 0);
client.login(process.env.TOKEN.trim()).then(() => {
    console.log('✅ Login promise resolved');
}).catch(err => {
    console.error('❌ Failed to login:', err.message);
});

const server = http.createServer((req, res) => {
    res.writeHead(200, { 'Content-Type': 'text/plain' });
    res.end('Velox Host is online!');
});
server.listen(process.env.PORT || 3000, () => {
    console.log('🌐 HTTP server running on port ' + (process.env.PORT || 3000));
});
