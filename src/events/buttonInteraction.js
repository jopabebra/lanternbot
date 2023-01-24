import {MessageEmbed, Permissions, MessageActionRow, MessageSelectMenu, Modal, TextInputComponent} from 'discord.js';
import { QuickDB, MySQLDriver } from 'quick.db';

import FLAGS from '../data/enums/flags.json' assert { type: 'json' };
import TICKET from '../data/configs/ticketConfigs.json' assert { type: 'json' };
import COLOR from '../data/enums/colors.json' assert { type: 'json' };
import DATABASE from '../data/enums/MySQL/profile_database.json' assert { type: 'json' };

const mysql = new MySQLDriver(DATABASE)
await mysql.connect();

const db = new QuickDB({ driver: mysql });



export default {
	name: 'interactionCreate',
	once: false,
	async execute(interaction) {
        if (interaction.constructor.name !== 'ButtonInteraction') return;

        const userDB = db.table(`user_${interaction.user.id}`);

        if (interaction.customId === 'openTicket') {

            await interaction.deferReply({ ephemeral: true }).catch(console.error);

            let guild = interaction.guild;
            let category = guild.channels.cache.get(TICKET.parentOpened);

            const category_channel = await guild.channels.cache.find(c => c.name === `${interaction.user.username}\＃${interaction.user.discriminator}`)
            if (category_channel) {
                var embed = new MessageEmbed()
                    .setDescription('В данный момент у Вас уже есть открытый билет! Дождитесь его удаления или откройте его.')
                    .setColor(COLOR.INV);

                return interaction.editReply({ embeds: [embed] })
            }
            
            guild.channels.create(`${interaction.user.username}\＃${interaction.user.discriminator}`, {
                type: 'GUILD_TEXT',
                parent: category,
                permissionOverwrites: [
                    {
                        id: interaction.user.id,
                        allow: [Permissions.FLAGS.VIEW_CHANNEL]
                    },
                    {
                        id: interaction.guild.id,
                        deny: [Permissions.FLAGS.VIEW_CHANNEL]
                    },
                    {
                        id: guild.roles.cache.get(TICKET.support),
                        allow: [Permissions.FLAGS.VIEW_CHANNEL, Permissions.FLAGS.SEND_MESSAGES]
                    }
                ]
            }).then(channel => {

                const embed_success = new MessageEmbed()
                    .setDescription(`Заявка создана! Перейдите в канал ${channel}.`)
                    .setColor(COLOR.GREEN)

                interaction.editReply({ embeds: [embed_success] })

                const embed_welcome = new MessageEmbed()
                    .setDescription(`:dove: Вы обратились к поддержке сервера **${interaction.guild.name}**! Пожалуйста, изложите как можно подробнее свою проблему и ожидайте ответа от оператора.`)
                    .setColor(COLOR.INV);

                const embed_info = new MessageEmbed()
                    .setDescription(`Чтобы 🔒 закрыть, 🔓 открыть или 🗑️ удалить билет, воспользуйтесь *настройками билета*!`)
                    .setFooter({ text: `Билеты рассматриваются в течении 24 часов!` })
                    .setColor(COLOR.PRIMARY)

                const row = new MessageActionRow()
                    .addComponents(
                        new MessageSelectMenu()
                            .setCustomId('ticketSettings')
                            .setPlaceholder('Настройки билета...')
                            .addOptions([
                                {
                                    label: 'Закрыть',
                                    emoji: '🔒',
                                    description: 'Закрыть билет',
                                    value: 'closeTicket',
                                },
                                {
                                    label: 'Открыть',
                                    emoji: '🔓',
                                    description: 'Открыть билет',
                                    value: 'openTicket',
                                },
                                {
                                    label: 'Удалить',
                                    emoji: '🗑️',
                                    description: 'Удалить билет',
                                    value: 'deleteTicket',
                                }
                            ])
                    );
                
                    channel.send({ content: `:ping_pong: Пинги: ${interaction.user} ${guild.roles.cache.get(TICKET.support)}\n\⠀`, embeds: [embed_welcome, embed_info], components: [row] }).then((message) => message.pin())
            })
        } else if (interaction.customId === 'sendApplication') {
    
            let status = await userDB.get(`applicationStatus`)
            if (status === null) status = 'reject';
    
            if (status === 'accepted') return;
            if (status === 'pending') return;
    
            const modal = new Modal()
                .setCustomId('applicationRequest')
                .setTitle('Заявка на вступление!')
    
            const gameName = new TextInputComponent()
                .setCustomId('gameName')
                .setLabel('Ваш игровой никнейм')
                .setPlaceholder('Краткий ответ...')
                .setRequired(true)
                .setMinLength(3)
                .setMaxLength(20)
                .setStyle('SHORT');
            
            const aboutYou = new TextInputComponent()
                .setCustomId('aboutYou')
                .setLabel('Расскажите о себе')
                .setPlaceholder('Развернутый ответ...')
                .setRequired(true)
                .setMinLength(15)
                .setStyle('PARAGRAPH');
            
            const yearsOld = new TextInputComponent()
                .setCustomId('yearsOld')
                .setLabel('Сколько Вам лет?')
                .setPlaceholder('Краткий ответ...')
                .setRequired(true)
                .setMaxLength(2)
                .setStyle('SHORT');
            
            const howFind = new TextInputComponent()
                .setCustomId('howFind')
                .setLabel('Откуда Вы о нас узнали?')
                .setPlaceholder('Развернутый ответ...')
                .setRequired(true)
                .setMinLength(5)
                .setStyle('PARAGRAPH');
    
            const row_1 = new MessageActionRow().addComponents(gameName);
            const row_2 = new MessageActionRow().addComponents(aboutYou);
            const row_3 = new MessageActionRow().addComponents(yearsOld);
            const row_4 = new MessageActionRow().addComponents(howFind);
    
            modal.addComponents(row_1, row_2, row_3, row_4)
    
            return await interaction.showModal(modal)
        }
	}
};