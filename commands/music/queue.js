// print a list of songs in the queue

// Queue status template
const status = queue =>
	`Volume: \`${queue.volume}%\` | Filter: \`${
		queue.filters.join(', ') || 'Off'
	}\` | Loop: \`${
		queue.repeatMode
			? queue.repeatMode === 2
				? 'All Queue'
				: 'This Song'
			: 'Off'
	}\` | Autoplay: \`${queue.autoplay ? 'On' : 'Off'}\``;