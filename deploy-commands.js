require('dotenv').config();
const { REST, Routes, SlashCommandBuilder, PermissionFlagsBits } = require('discord.js');

const commands = [
    new SlashCommandBuilder()
        .setName('ticket')
        .setDescription('Opens the support ticket panel')
        .setDefaultMemberPermissions(PermissionFlagsBits.Administrator),
    new SlashCommandBuilder()
        .setName('ticketbot')
        .setDescription('Opens the custom bot purchase panel')
        .setDefaultMemberPermissions(PermissionFlagsBits.Administrator),
    new SlashCommandBuilder()
        .setName('tos')
        .setDescription('Opens the Terms of Service panel')
        .setDefaultMemberPermissions(PermissionFlagsBits.Administrator),
    new SlashCommandBuilder()
        .setName('status')
        .setDescription('Shows bot and server status'),
    new SlashCommandBuilder()
        .setName('autorole')
        .setDescription('Toggle auto-role on/off')
        .setDefaultMemberPermissions(PermissionFlagsBits.Administrator),
    new SlashCommandBuilder()
        .setName('test')
        .setDescription('Send a test welcome message')
        .setDefaultMemberPermissions(PermissionFlagsBits.Administrator),
    new SlashCommandBuilder()
        .setName('verify')
        .setDescription('Send the verification panel')
        .setDefaultMemberPermissions(PermissionFlagsBits.Administrator),
    new SlashCommandBuilder()
        .setName('exchangesetup')
        .setDescription('Send the exchange trade panel')
        .setDefaultMemberPermissions(PermissionFlagsBits.Administrator),
    new SlashCommandBuilder()
        .setName('plansbot')
        .setDescription('Send the bot hosting plans panel')
        .setDefaultMemberPermissions(PermissionFlagsBits.Administrator),
    new SlashCommandBuilder()
        .setName('support')
        .setDescription('Send the support panel')
        .setDefaultMemberPermissions(PermissionFlagsBits.Administrator)
].map(command => command.toJSON());

const rest = new REST({ version: '10' }).setToken(process.env.TOKEN);

(async () => {
    try {
        console.log('🔄 Registering slash commands...');
        await rest.put(
            Routes.applicationGuildCommands(process.env.CLIENT_ID, '1523717705130315877'),
            { body: commands }
        );
        console.log('✅ Done!');
    } catch (error) {
        console.error('❌ Error:', error);
    }
})();
