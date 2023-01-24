import FLAGS from '../data/enums/flags.json' assert { type: 'json' };;
import {getSeconds} from '../functions/lites/getSeconds.js';
import {getDeclension} from '../functions/lites/getDeclension.js';

const timeout = new Map();

export default {
	name: 'interactionCreate',
	async execute(interaction, client) {
		if (interaction.isCommand()) {
			const command = client.commands.get(interaction.commandName);

			if (command?.timeout) {
				let time = Math.trunc(new Date().getTime() / 1000);
				let id = '';

				if (command?.timeout[1] === FLAGS.GUILD) {
					id = ((interaction.guild) ? interaction.guildId : interaction.userId) + interaction.commandName;
				} else if (command?.timeout[1] === FLAGS.GLOBAL) {
					id = 'global' + interaction.commandName;
				}

				if (!timeout.has(id) || timeout.get(id) < time) {
					timeout.delete(id);
					timeout.set(id, Math.trunc(time + command?.timeout[0]));
				} else {
					const seconds = getSeconds((timeout.get(id) - time) * 1000);
					return await interaction.reply({
						content: `Подожди <t:${Math.round(Date.now() / 1000 + seconds)}:R> секунд${getDeclension(seconds, ['а', 'ы', ''])}`,
						ephemeral: true
					}).catch(console.error);
				}
			}

			if (command?.restriction && command.restriction === FLAGS?.CHANNEL && !interaction?.guild) {
				return await interaction.reply({
					content: `Команда **${interaction?.commandName}** доступна только в каналах гильдии!`, ephemeral: true
				}).catch(console.error);
			}

			if (command?.restriction && command.restriction === FLAGS?.DMCHANNEL && interaction?.guild) {
				return await interaction.reply({
					content: `Команда **${interaction?.commandName}** доступна только в личных сообщениях!`, ephemeral: true}).catch(console.error);
			}

			if (command?.restriction && command.restriction === FLAGS?.BOT_OWNER && interaction?.member?.id !== process.env.OWNER_ID) {
				return await interaction.reply({
					content: `Команда **${interaction?.commandName}** не доступна пользователям!`, ephemeral: true
				}).catch(console.error);
			}

			for (const p of command?.permissions) {
				if (!interaction.member.permissions.has(p)) {
					return await interaction.reply({
						content: `Нет прав **${p}** для использования команды ${interaction.commandName}`, ephemeral: true
					}).catch(console.error);
				}
			}

			try {
				await command.execute(interaction, interaction.client);
			} catch (error) {
				console.error(error);
				await interaction.reply({
					content: `При выполнении команды **${interaction.commandName}**, прозишла ошибка!`, ephemeral: true
				}).catch(console.error);
			}
		}
	}
};