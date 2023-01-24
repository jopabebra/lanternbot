import {SlashCommandBuilder} from '@discordjs/builders';
import {Client, Intents, MessageEmbed, Permissions, MessageActionRow, MessageButton} from 'discord.js';

const client = new Client({intents: [Intents.FLAGS.GUILDS, Intents.FLAGS.GUILD_PRESENCES, Intents.FLAGS.GUILD_MESSAGES]});

import FLAGS from '../../../data/enums/flags.json' assert { type: 'json' };
import APP from '../../../data/configs/applicationConfigs.json' assert { type: 'json' };
import COLOR from '../../../data/enums/colors.json' assert { type: 'json' };

export default {
    data: new SlashCommandBuilder()
    .setName('заявка')
    .setDescription('📥 Создать сообщение заявок.'),
    restriction: FLAGS.CHANNEL,
    timeout: [-1, FLAGS.GUILD],
    permissions: [Permissions.FLAGS.MANAGE_GUILD],
    async execute(interaction, client) {
        const channel = client.channels.cache.get(APP.channel)

        const row = new MessageActionRow()
            .addComponents(
                new MessageButton()
                    .setCustomId('sendApplication')
                    .setLabel('Присоединиться!')
                    .setEmoji('🎮')
                    .setStyle('PRIMARY'),
                new MessageButton()
                    .setLabel('Правила сервера')
                    .setEmoji('📜')
                    .setURL('https://discord.com/channels/977873582782828647/977879104810524692')
                    .setStyle('LINK'),
            );
        
        const img = new MessageEmbed()
            .setAuthor({ name: interaction.guild.name, iconURL: interaction.guild.iconURL({format: 'png', size: 1024}) || 'https://cdn.discordapp.com/embed/avatars/0.png' })
            .setColor(COLOR.PURPLE)
            .setImage('https://cdn.discordapp.com/attachments/1036531698134962186/1038821822541611149/u123nknown.png');

        const embed = new MessageEmbed()
            
            .setDescription('🕊️ ***Добро пожаловать**!* Мы рады видеть Вас на нашем сервере, пожалуйста, ознакомьтесь с правилами сервера перед вступлением.')
            .setColor(COLOR.INV)
            .setImage('https://www.dropbox.com/s/wyb2rlcgn9ba0oi/embed_invisible_image.png?dl=1')

        await interaction.reply('Успешно! Сообщение отправлено.');

        return channel.send({
            embeds: [img, embed],
            components: [row]
        })
    }
};