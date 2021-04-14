import { createSlashCommandHandler } from '@glenstack/cf-workers-discord-bot'

import { whoisCommand, whoisHandler } from './commands/whois'
import { updateCommand, updateHandler } from './commands/update'

addEventListener('fetch', (event) => {
  try {
    const slashCommandHandler = createSlashCommandHandler({
      applicationID: '831960716733972591',
      applicationSecret: APPLICATION_SECRET,
      publicKey:
        '76de74f43978374e7ea2914e9537d49e4935b8432eedb5c1c409636c9341e5e6',
      commands: [
        [whoisCommand, whoisHandler],
        [updateCommand, updateHandler],
      ],
    })

    event.respondWith(slashCommandHandler(event.request))
  } catch (err) {
    event.respondWith(new Response(err.message, { status: 500 }))
  }
})
