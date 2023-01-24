import {SlashCommandBuilder} from '@discordjs/builders';
import {Client, Intents, MessageEmbed, Permissions, MessageActionRow, MessageButton} from 'discord.js';

const client = new Client({intents: [Intents.FLAGS.GUILDS, Intents.FLAGS.GUILD_PRESENCES, Intents.FLAGS.GUILD_MESSAGES]});

import FLAGS from '../../../data/enums/flags.json' assert { type: 'json' };
import TICKET from '../../../data/configs/ticketConfigs.json' assert { type: 'json' };
import COLOR from '../../../data/enums/colors.json' assert { type: 'json' };

export default {
    data: new SlashCommandBuilder()
    .setName('система')
    .setDescription('🎫 Установить систему тикетов.')
    .addSubcommand(subcommand =>
		subcommand
		.setName('тикетов')
		.setDescription('🎫 Установить систему тикетов.')),
    restriction: FLAGS.CHANNEL,
    timeout: [-1, FLAGS.GUILD],
    permissions: [Permissions.FLAGS.MANAGE_GUILD],
    async execute(interaction, client) {
        const channel = client.channels.cache.get(TICKET.ticketChannel)

        const row = new MessageActionRow()
            .addComponents(
                new MessageButton()
                    .setCustomId('openTicket')
                    .setLabel('Обратиться к поддержке')
                    .setEmoji('📩')
                    .setStyle('PRIMARY'),
            );
        
        const image = new MessageEmbed()
            .setAuthor({ name: interaction.guild.name, iconURL: interaction.guild.iconURL({format: 'png', size: 1024}) || 'https://cdn.discordapp.com/embed/avatars/0.png' })
            .setImage('https://www.dropbox.com/s/864o70xa2ja3u96/support_image.png?dl=1')
            .setColor(COLOR.PRIMARY);
        
        const embed = new MessageEmbed()
            .setDescription(`Нажмите на кнопку ниже, для связи со службой поддержки. Все запросы рассматриваются в течении *24 часов.*`)
            .setImage('https://www.dropbox.com/s/wyb2rlcgn9ba0oi/embed_invisible_image.png?dl=1')
            .setColor(COLOR.INV);

        const examples = new MessageEmbed()
            .addFields(
                { name: `⚖️ Форма заполнения судебного дела`, value: `\`1.\` Ваш никнейм;\n\`2.\` Никнейм нарушителя;\n\`3.\` Координаты;\n\`4.\` Описание происшествия;\n\`5.\` Скриншоты.`, inline: true },
                { name: `💡 Форма заполнения вопроса/идеи`, value: `\`1.\` Ваш никнейм;\n\`2.\` Ваше обращение.`, inline: true }
            )
            .setImage('https://www.dropbox.com/s/wyb2rlcgn9ba0oi/embed_invisible_image.png?dl=1')
            .setColor(COLOR.INV);

        await interaction.reply('Успешно! Сообщение отправлено.');

        return channel.send({
            embeds: [image, embed, examples],
            components: [row]
        })
    }
};