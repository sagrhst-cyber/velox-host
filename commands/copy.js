const { SlashCommandBuilder, PermissionFlagsBits, ChannelType } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('copy')
        .setDescription('Copy channels and categories from another server')
        .addStringOption(option =>
            option.setName('source')
                .setDescription('Source server ID to copy from')
                .setRequired(true)
        )
        .addChannelOption(option =>
            option.setName('category')
                .setDescription('Copy only this specific category (optional)')
                .setRequired(false)
        )
        .setDefaultMemberPermissions(PermissionFlagsBits.Administrator),

    async execute(interaction) {
        const sourceGuildId = interaction.options.getString('source');
        const specificCategory = interaction.options.getChannel('category');

        const sourceGuild = interaction.client.guilds.cache.get(sourceGuildId);

        if (!sourceGuild) {
            return interaction.reply({
                content: '❌ Δεν βρέθηκε ο server με αυτό το ID. Βεβαιώσου ότι το bot είναι στον server πηγή.',
                ephemeral: true
            });
        }

        const targetGuild = interaction.guild;

        await interaction.deferReply({ ephemeral: true });

        try {
            const categories = await sourceGuild.channels.cache.filter(ch => ch.type === ChannelType.GuildCategory);

            let targetCategories = new Map();

            for (const [id, category] of categories) {
                if (specificCategory && category.id !== specificCategory.id) {
                    continue;
                }

                const newCategory = await targetGuild.channels.create({
                    name: category.name,
                    type: ChannelType.GuildCategory,
                    permissionOverwrites: category.permissionOverwrites.cache.map(perm => ({
                        id: perm.id,
                        type: perm.type,
                        allow: perm.allow,
                        deny: perm.deny
                    }))
                });

                targetCategories.set(category.id, newCategory);
            }

            const textChannels = await sourceGuild.channels.cache.filter(ch =>
                ch.type === ChannelType.GuildText ||
                ch.type === ChannelType.GuildAnnouncement
            );

            for (const [id, channel] of textChannels) {
                if (specificCategory && channel.parentId !== specificCategory.id) {
                    continue;
                }

                const parentCategory = targetCategories.get(channel.parentId);

                await targetGuild.channels.create({
                    name: channel.name,
                    type: channel.type === ChannelType.GuildAnnouncement ?
                        ChannelType.GuildAnnouncement : ChannelType.GuildText,
                    topic: channel.topic || '',
                    nsfw: channel.nsfw,
                    rateLimitPerUser: channel.rateLimitPerUser,
                    parent: parentCategory ? parentCategory.id : null,
                    permissionOverwrites: channel.permissionOverwrites.cache.map(perm => ({
                        id: perm.id,
                        type: perm.type,
                        allow: perm.allow,
                        deny: perm.deny
                    }))
                });
            }

            const voiceChannels = await sourceGuild.channels.cache.filter(ch =>
                ch.type === ChannelType.GuildVoice
            );

            for (const [id, channel] of voiceChannels) {
                if (specificCategory && channel.parentId !== specificCategory.id) {
                    continue;
                }

                const parentCategory = targetCategories.get(channel.parentId);

                await targetGuild.channels.create({
                    name: channel.name,
                    type: ChannelType.GuildVoice,
                    bitrate: channel.bitrate,
                    userLimit: channel.userLimit,
                    parent: parentCategory ? parentCategory.id : null,
                    permissionOverwrites: channel.permissionOverwrites.cache.map(perm => ({
                        id: perm.id,
                        type: perm.type,
                        allow: perm.allow,
                        deny: perm.deny
                    }))
                });
            }

            const forumChannels = await sourceGuild.channels.cache.filter(ch =>
                ch.type === ChannelType.GuildForum
            );

            for (const [id, channel] of forumChannels) {
                if (specificCategory && channel.parentId !== specificCategory.id) {
                    continue;
                }

                const parentCategory = targetCategories.get(channel.parentId);

                await targetGuild.channels.create({
                    name: channel.name,
                    type: ChannelType.GuildForum,
                    topic: channel.topic || '',
                    nsfw: channel.nsfw,
                    rateLimitPerUser: channel.rateLimitPerUser,
                    parent: parentCategory ? parentCategory.id : null,
                    defaultAutoArchiveDuration: channel.defaultAutoArchiveDuration,
                    permissionOverwrites: channel.permissionOverwrites.cache.map(perm => ({
                        id: perm.id,
                        type: perm.type,
                        allow: perm.allow,
                        deny: perm.deny
                    }))
                });
            }

            await interaction.editReply({
                content: `✅ Αντιγράφηκαν επιτυχώς οι κατηγορίες και τα κανάλια από τον **${sourceGuild.name}** στον **${targetGuild.name}**`
            });

        } catch (error) {
            console.error('Copy error:', error);
            await interaction.editReply({
                content: `❌ Παρουσιάστηκε σφάλμα: ${error.message}`
            });
        }
    }
};
