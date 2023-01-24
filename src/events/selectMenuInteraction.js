import {MessageEmbed} from 'discord.js';
import { QuickDB, MySQLDriver } from 'quick.db';

import TICKET from '../data/configs/ticketConfigs.json' assert { type: 'json' };
import APP from '../data/configs/applicationConfigs.json' assert { type: 'json' };
import COLOR from '../data/enums/colors.json' assert { type: 'json' };

import TICKET_DATABASE from '../data/enums/MySQL/ticket_database.json' assert { type: 'json' };
import USER_DATABASE from '../data/enums/MySQL/profile_database.json' assert { type: 'json' };

const mysql_ticket = new MySQLDriver(TICKET_DATABASE)
const mysql_user = new MySQLDriver(USER_DATABASE)

await mysql_ticket.connect();
await mysql_user.connect();

const db_ticket = new QuickDB({ driver: mysql_ticket });
const db_user = new QuickDB({ driver: mysql_user });

export default {
	name: 'interactionCreate',
	once: false,
	async execute(interaction) {
        if (interaction.constructor.name !== 'SelectMenuInteraction') return;

        let user = interaction.message.mentions.members.first();

        const ticketDB = db_ticket.table(`ticket_${interaction.channel.id}`);
        const userDB = db_user.table(`user_${user.id}`);

        if (interaction.customId === 'ticketSettings') {

            let value = interaction.values;
            let channel = interaction.channel;
            let guild = interaction.guild;
            let member = interaction.message.mentions.members.first();
            let support_role = guild.roles.cache.get(TICKET.support);

            let ticketStatus = await ticketDB.get('ticketStatus')
            if (ticketStatus === null) ticketStatus = 'open';

            switch(value.join('')) {
                case 'closeTicket':
                    if (ticketStatus === 'close') break;

                    await interaction.deferReply({ ephemeral: false }).catch(console.error);
                    await channel.permissionOverwrites.edit(member, { SEND_MESSAGES: false, USE_APPLICATION_COMMANDS: false });
                
                    await ticketDB.set('ticketStatus', 'close');

                    var embed = new MessageEmbed()
                        .setDescription(`:lock: Билет закрыт пользователем ${interaction.user}. Спасибо за обращение к службе поддержки!`)
                        .setColor(COLOR.INV)
        
                    await interaction.editReply({ embeds: [embed] });
                    break;
                case 'openTicket':
                    if (ticketStatus === 'open') break;

                    await interaction.deferReply({ ephemeral: false }).catch(console.error);
                    await channel.permissionOverwrites.edit(member, { SEND_MESSAGES: true, USE_APPLICATION_COMMANDS: true });
        
                    await ticketDB.set('ticketStatus', 'open');

                    var embed = new MessageEmbed()
                        .setDescription(`:unlock: Билет открыт пользователем ${interaction.user}. Чем мы можем Вам помочь?`)
                        .setColor(COLOR.INV)
        
                    await interaction.editReply({ content: `:ping_pong: Пинги: ${interaction.message.mentions.users.first()} ${guild.roles.cache.get(TICKET.support)}\n\⠀`, embeds: [embed] });
                    break;
                case 'deleteTicket':
                    if (ticketStatus === 'open') break;
                    await interaction.deferReply({ ephemeral: true }).catch(console.error);

                    if (interaction.member.roles.cache.has(support_role.id)) {
                        return channel.delete();
                    } else {
                        var embed = new MessageEmbed()
                            .setDescription(`Удалить билет может только член технической поддержки! Вы можете открыть этот билет снова, если Вам вновь понадобится связаться с поддержкой.`)
                            .setColor(COLOR.RED)

                        return await interaction.editReply({ embeds: [embed] })
                    }
            }

        } else if (interaction.customId === 'applicationSettings') {

            let value = interaction.values;
            let guild = interaction.guild;
            let user = interaction.message.mentions.members.first();
            let message = interaction.message;

            let channel = interaction.channel;
            let channel_console = guild.channels.cache.get(APP.whitelist);

            let new_role = guild.roles.cache.get(APP.roleId);
            let old_role = guild.roles.cache.get(APP.oldRoleId);

            switch(value.join('')) {
                case 'acceptApplication':

                    var embed_accept = new MessageEmbed()
                        .setAuthor({ name: interaction.guild.name, iconURL: interaction.guild.iconURL({format: 'png', size: 1024}) || 'https://cdn.discordapp.com/embed/avatars/0.png' })
                        .setDescription(`✅ *Ваша заявка была **одобрена**!* Ник \`${await userDB.get('nickname')}\` был добавлен в белый список сервера, 🕊️ *приятной игры!*`)
                        .setColor(COLOR.GREEN);
                    
                    var embed_accept_info = new MessageEmbed()
                        .setAuthor({ name: interaction.user.tag, iconURL: interaction.user.avatarURL({format: 'png', size: 1024}) || 'https://cdn.discordapp.com/embed/avatars/0.png' })
                        .setDescription(`✅ ${interaction.user} одобрил заявку пользователя ${user} (\`${await userDB.get('nickname')}\`)`)
                        .setColor(COLOR.INV);
                    
                    if (user.manageable) {
                        await user.roles.add(new_role);
                        await user.roles.remove(old_role);
                        await user.setNickname(`${await userDB.get('nickname')}`);
                    }

                    await user.send({ embeds: [embed_accept] }).catch(() => console.log(`[${user.id}] Я не смог отправить сообщение ${user.username}!`)), await userDB.set('applicationStatus', 'accepted'), await channel_console.send(`easywl add ${await userDB.get('nickname')}`);
                    return await message.delete(), channel.send({ embeds: [embed_accept_info] });

                case 'rejectApplication': 

                    var embed_reject = new MessageEmbed()
                        .setAuthor({ name: interaction.guild.name, iconURL: interaction.guild.iconURL({format: 'png', size: 1024}) || 'https://cdn.discordapp.com/embed/avatars/0.png' })
                        .setDescription(`🚫 *Ваша заявка была **отклонена**!* Вы можете вновь подать заявку на вступление.`)
                        .setColor(COLOR.RED);
                        
                    var embed_reject_info = new MessageEmbed()
                        .setAuthor({ name: interaction.user.tag, iconURL: interaction.user.avatarURL({format: 'png', size: 1024}) || 'https://cdn.discordapp.com/embed/avatars/0.png' })
                        .setDescription(`🚫 ${interaction.user} отклонил заявку пользователя ${user} (\`${await userDB.get('nickname')}\`)`)
                        .setColor(COLOR.INV);
                        
                    await user.send({ embeds: [embed_reject] }).catch(() => console.log(`[${user.id}] Я не смог отправить сообщение ${user.username}!`)), await userDB.set('applicationStatus', 'reject');
                    return await message.delete(), channel.send({ embeds: [embed_reject_info] });
                
                case 'errorApplication': 

                    var embed_err = new MessageEmbed()
                        .setAuthor({ name: interaction.guild.name, iconURL: interaction.guild.iconURL({format: 'png', size: 1024}) || 'https://cdn.discordapp.com/embed/avatars/0.png' })
                        .setDescription(`❔ *Ваша заявка была отмечена **ошибочной**!* Вы можете вновь подать заявку на вступление.`)
                        .setColor(COLOR.RED);
                        
                    var embed_err_info = new MessageEmbed()
                        .setAuthor({ name: interaction.user.tag, iconURL: interaction.user.avatarURL({format: 'png', size: 1024}) || 'https://cdn.discordapp.com/embed/avatars/0.png' })
                        .setDescription(`❔ ${interaction.user} отметил заявку пользователя ${user} (\`${await userDB.get('nickname')}\`) ошибочной!`)
                        .setColor(COLOR.INV);
                        
                    await user.send({ embeds: [embed_err] }).catch(() => console.log(`[${user.id}] Я не смог отправить сообщение ${user.username}!`)), await userDB.set('applicationStatus', 'error');
                    return await message.delete(), channel.send({ embeds: [embed_err_info] });
            }
        }
	}
};