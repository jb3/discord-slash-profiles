import {
  ApplicationCommand,
  ApplicationCommandOptionType,
  Interaction,
  InteractionHandler,
  InteractionResponse,
  InteractionResponseType,
} from '@glenstack/cf-workers-discord-bot'
import { getProfile, setProfile, updateProfile, UserProfile } from '../database'

const updateCommand: ApplicationCommand = {
  name: 'update',
  description: 'Update your profile.',
  options: [
    {
      name: 'languages',
      type: ApplicationCommandOptionType.SUB_COMMAND_GROUP,
      description: 'Manage the programming languages in your profile.',
      options: [
        {
          name: 'add',
          type: ApplicationCommandOptionType.SUB_COMMAND,
          description: 'Add a language to your profile',
          options: [
            {
              name: 'language',
              description: 'The language to add',
              type: ApplicationCommandOptionType.STRING,
              required: true,
            },
          ],
        },
        {
          name: 'remove',
          type: ApplicationCommandOptionType.SUB_COMMAND,
          description: 'Remove a language from your profile',
          options: [
            {
              name: 'language',
              description: 'The language to add',
              type: ApplicationCommandOptionType.STRING,
              required: true,
            },
          ],
        },
      ],
    },
    {
      name: 'bio',
      type: ApplicationCommandOptionType.SUB_COMMAND,
      description: 'Manage the biography in your profile.',
      options: [
        {
          name: 'text',
          description: 'The text for your biography',
          required: true,
          type: ApplicationCommandOptionType.STRING,
        },
      ],
    },
  ],
}

const updateHandler: InteractionHandler = async (
  interaction: Interaction,
): Promise<InteractionResponse> => {
  try {
    let field = interaction.data!.options![0].name

    if (field === 'languages') {
      return await handleLanguages(interaction)
    } else if (field === 'bio') {
      return await handleBio(interaction)
    } else {
      return {
        type: InteractionResponseType.ChannelMessageWithSource,
        data: {
          // @ts-ignore
          flags: 64,
          content: 'Unsupported field.',
        },
      }
    }
  } catch (err) {
    return {
      type: InteractionResponseType.ChannelMessageWithSource,
      data: {
        content: err.message,
      },
    }
  }
}

async function handleLanguages(
  interaction: Interaction,
): Promise<InteractionResponse> {
  let userProfile = await getProfile(interaction.member.user.id)

  if (interaction.data!.options![0].options![0].name === 'add') {
    let language = interaction.data!.options![0].options![0].options![0].value!
    if (userProfile) {
      if (userProfile.data.languages?.length >= 5) {
        return {
          type: InteractionResponseType.ChannelMessageWithSource,
          data: {
            // @ts-ignore
            flags: 64,
            content: ':no_entry_sign:  You can have a maximum of 5 languages.',
          },
        }
      } else {
        let newProfile: UserProfile = {
          user_id: interaction.member.user.id,
          languages: userProfile.data.languages.concat(language),
          bio: userProfile.data.bio,
        }

        await updateProfile(userProfile.ref, newProfile)
      }
    } else {
      let userProfile: UserProfile = {
        user_id: interaction.member.user.id,
        languages: [language],
        bio: 'No bio set yet!',
      }

      await setProfile(userProfile)
    }
  } else {
    // Handle removal
    let language = interaction.data!.options![0].options![0].options![0].value!

    if (!userProfile) {
      return {
        type: InteractionResponseType.ChannelMessageWithSource,
        data: {
          // @ts-ignore
          flags: 64,
          content: ":warning: You don't have a profile!",
        },
      }
    }

    let index = userProfile.data.languages.indexOf(language)

    if (index === -1) {
      return {
        type: InteractionResponseType.ChannelMessageWithSource,
        data: {
          // @ts-ignore
          flags: 64,
          content: ":warning: You haven't added that language!",
        },
      }
    }

    let newLanguages = userProfile.data.languages.filter(
      (item) => item !== language,
    )

    let newProfile: UserProfile = {
      user_id: interaction.member.user.id,
      languages: newLanguages,
      bio: userProfile.data.bio,
    }

    await updateProfile(userProfile.ref, newProfile)
  }

  return {
    type: InteractionResponseType.ChannelMessageWithSource,
    data: {
      // @ts-ignore
      flags: 64,
      content: ':white_check_mark: Updated!',
    },
  }
}

async function handleBio(
  interaction: Interaction,
): Promise<InteractionResponse> {
  let userProfile = await getProfile(interaction.member.user.id)
  let newBio = interaction.data!.options![0].options![0].value!

  let newProfile: UserProfile;

  if (!userProfile) {
    let newProfile: UserProfile = {
      bio: newBio,
      user_id: interaction.member.user.id,
      languages: [],
    }

    await setProfile(newProfile);
  } else {
    let newProfile: UserProfile = {
      bio: newBio,
      user_id: userProfile.data.user_id,
      languages: userProfile.data.languages,
    }

    await updateProfile(userProfile.ref, newProfile)
  }

  return {
    type: InteractionResponseType.ChannelMessageWithSource,
    data: {
      // @ts-ignore
      flags: 64,
      content: ':white_check_mark: Updated!',
    },
  }
}

export { updateCommand, updateHandler }
