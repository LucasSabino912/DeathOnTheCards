const normalizeName = (name = '') =>
    name
      .toString()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .toLowerCase()
      .replace(/[^a-z0-9\s]/g, '')
      .trim()
      .replace(/\s+/g, ' ')

  const IMAGE_MAP = {
    "hercule poirot": "/cards/detective_poirot.png",
    "miss marple": "/cards/detective_marple.png",
    "mr satterthwaite": "/cards/detective_satterthwaite.png",
    "parker pyne": "/cards/detective_pyne.png",
    "lady eileen bundle brent": "/cards/detective_brent.png",
    "tommy beresford": "/cards/detective_tommyberesford.png",
    "tuppence beresford": "/cards/detective_tuppenceberesford.png",
    "harley quin wildcard": "/cards/detective_quin.png",
    "adriane oliver": "/cards/detective_oliver.png",
    "not so fast": "/cards/instant_notsofast.png",
    "cards off the table": "/cards/event_cardsonthetable.png",
    "another victim": "/cards/event_anothervictim.png",
    "dead card folly": "/cards/event_deadcardfolly.png",
    "look into the ashes": "/cards/event_lookashes.png",
    "card trade": "/cards/event_cardtrade.png",
    "and then there was one more": "/cards/event_onemore.png",
    "delay the murderers escape": "/cards/event_delayescape.png",
    "early train to paddington": "/cards/event_earlytrain.png",
    "point your suspicions": "/cards/event_pointsuspicions.png",
    "blackmailed": "/cards/devious_blackmailed.png",
    "social faux pas": "/cards/devious_fauxpas.png"
  };

  const getCardsImage = card => {
    if (!card || !card.name) return null
    const key = normalizeName(card.name)
    return IMAGE_MAP[key] ?? null
  }

export default getCardsImage