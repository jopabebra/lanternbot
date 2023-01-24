import {MessageEmbed, Permissions, MessageActionRow, Modal, TextInputComponent, MessageSelectMenu} from 'discord.js';
import { QuickDB, MySQLDriver } from 'quick.db';

import USER_DATABASE from '../data/enums/MySQL/profile_database.json' assert { type: 'json' };
import COLOR from '../data/enums/colors.json' assert { type: 'json' };
import APP from '../data/configs/applicationConfigs.json' assert { type: 'json' };

const mysql = new MySQLDriver(USER_DATABASE)
await mysql.connect();

const db = new QuickDB({ driver: mysql });

export default {
	name: 'interactionCreate',
	once: false,
	async execute(interaction) {
        if (interaction.constructor.name !== 'ModalSubmitInteraction') return;

        const userDB = db.table(`user_${interaction.user.id}`);

        if (interaction.customId === 'applicationRequest') {

            const guild = interaction.guild;
            const channel = guild.channels.cache.get(APP.applicationChannel);

            await interaction.deferReply({ ephemeral: true }).catch(console.error);

            const gameName = interaction.fields.getTextInputValue('gameName');
            const aboutYou = interaction.fields.getTextInputValue('aboutYou');
            const yearsOld = interaction.fields.getTextInputValue('yearsOld');
            const howFind = interaction.fields.getTextInputValue('howFind');

            let embed_author = new MessageEmbed()
                .setAuthor({ name: interaction.guild.name, iconURL: interaction.guild.iconURL({format: 'png', size: 1024}) || 'https://cdn.discordapp.com/embed/avatars/0.png' })
                .setDescription('📥 Спасибо за оставленную анкету! Заявка отправлена администрации на расмотрение. 💭 Ответ поступит к Вам в личные сообщения, убедитесь что они открыты!')
                .addFields(
                    { name: '🖥️ Указанный ник:', value: `\`\`\`${gameName}\`\`\``  },
                    { name: '👤 Информация о Вас:', value: `\`\`\`${aboutYou}\`\`\`` },
                    { name: '🧑 Ваш возраст:', value: `\`\`\`${yearsOld}\`\`\`` },
                    { name: '👥 Как Вы нашли нас:', value: `\`\`\`${howFind}\`\`\`` }
                )
                .setThumbnail(`https://cravatar.eu/helmhead/${gameName}` || 'https://www.dropbox.com/s/caysh8b452z05ux/invalid_nickname.png?dl=1')
                .setColor(COLOR.PRIMARY);

            let embed = new MessageEmbed()
            .setAuthor({ name: interaction.user.tag, iconURL: interaction.user.avatarURL({format: 'png', size: 1024}) || 'https://cdn.discordapp.com/embed/avatars/0.png' })
            .addFields(
                { name: '🖥️ Игровой ник:', value: `\`\`\`${gameName}\`\`\``  },
                { name: '👤 Биография:', value: `\`\`\`${aboutYou}\`\`\``  },
                { name: '🧑 Возраст:', value: `\`\`\`${yearsOld}\`\`\`` },
                { name: '👥 Как нашли проект:', value: `\`\`\`${howFind}\`\`\``  }
            )
            .setThumbnail(`https://cravatar.eu/helmhead/${gameName}` || 'https://www.dropbox.com/s/caysh8b452z05ux/invalid_nickname.png?dl=1')
            .setColor(COLOR.PRIMARY);

            const row = new MessageActionRow()
            .addComponents(
                new MessageSelectMenu()
                    .setCustomId('applicationSettings')
                    .setPlaceholder('Действия...')
                    .addOptions([
                        {
                            label: 'Принять',
                            emoji: '✅',
                            description: 'Принять анкету',
                            value: 'acceptApplication',
                        },
                        {
                            label: 'Отказать',
                            emoji: '🚫',
                            description: 'Отказать анкету',
                            value: 'rejectApplication',
                        },
                        {
                            label: 'Ошибка в анкете',
                            emoji: '❔',
                            description: 'Анкета содержит ошибку',
                            value: 'errorApplication',
                        }
                    ])
            );

            await userDB.set('nickname', `${gameName}`);
            await userDB.set('applicationStatus', 'pending');

            return await interaction.editReply({ embeds: [embed_author] }), await channel.send({ content: `${interaction.user}`, embeds: [embed], components: [row] })
            
        }
	}
};