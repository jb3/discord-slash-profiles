import {
  ApplicationCommand,
  ApplicationCommandOptionType,
  Interaction,
  InteractionHandler,
  InteractionResponse,
  InteractionResponseType,
} from '@glenstack/cf-workers-discord-bot'

import { getProfile, UserProfile } from '../database'
import { randomColor } from '../utils'

const whoisCommand: ApplicationCommand = {
  name: 'whois',
  description: 'Find the profile for a user.',
  options: [
    {
      type: ApplicationCommandOptionType.USER,
      name: 'user',
      description: 'User to find profile information for',
      required: true,
    },
  ],
}

const whoisHandler: InteractionHandler = async (
  interaction: Interaction,
): Promise<InteractionResponse> => {
  try {
    const userID = interaction.data!.options![0].value!

    const userProfile = await getProfile(userID)

    // @ts-ignore
    const discordUserDetails = interaction.data!.resolved.users[userID]

    if (userProfile) {
      let languages = userProfile.data.languages
        .map((lang) => '• ' + lang)
        .join('\n');

      let languagesText = userProfile.data.languages.length !== 0 ? `**Languages:**\n${languages}` : "**Languages:**\n*None! Add some with `/update`*";

      return {
        type: InteractionResponseType.ChannelMessageWithSource,
        data: {
          content: '',
          embeds: [
            {
              title: `${discordUserDetails.username}#${discordUserDetails.discriminator}`,
              description: `${userProfile.data.bio}\n\n${languagesText}`,
              thumbnail: {
                url: `https://cdn.discordapp.com/avatars/${discordUserDetails.id}/${discordUserDetails.avatar}.png`,
              },
              color: randomColor(),
              footer: {
                text: 'Create your own with the /update commands',
              },
            },
          ],
        },
      }
    } else {
      return {
        type: InteractionResponseType.ChannelMessageWithSource,
        data: {
          // @ts-ignore
          flags: 64,
          content: 'No profile found for that user.',
        },
      }
    }
  } catch (err) {
    return {
      type: InteractionResponseType.ChannelMessageWithSource,
      data: {
        // @ts-ignore
        flags: 64, // Epheremal message.
        content: err.message,
      },
    }
  }
}

export { whoisCommand, whoisHandler }
