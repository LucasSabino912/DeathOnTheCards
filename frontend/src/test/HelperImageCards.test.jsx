import { describe, it, expect } from 'vitest';
import getCardsImage from '../helpers/HelperImageCards';

const TEST_CASES = [
  { name: 'Hercule Poirot', expected: '/cards/detective_poirot.png' },
  { name: 'Miss Marple', expected: '/cards/detective_marple.png' },
  { name: 'Mr Satterthwaite', expected: '/cards/detective_satterthwaite.png' },
  { name: 'Parker Pyne', expected: '/cards/detective_pyne.png' },
  { name: 'Lady Eileen Bundle Brent', expected: '/cards/detective_brent.png' },
  { name: 'Tommy Beresford', expected: '/cards/detective_tommyberesford.png' },
  { name: 'Tuppence Beresford', expected: '/cards/detective_tuppenceberesford.png' },
  { name: 'Harley Quin Wildcard', expected: '/cards/detective_quin.png' },
  { name: 'Adriane Oliver', expected: '/cards/detective_oliver.png' },
  { name: 'Not So Fast', expected: '/cards/instant_notsofast.png' },
  { name: 'Cards Off The Table', expected: '/cards/event_cardsonthetable.png' },
  { name: 'Another Victim', expected: '/cards/event_anothervictim.png' },
  { name: 'Dead Card Folly', expected: '/cards/event_deadcardfolly.png' },
  { name: 'Look Into The Ashes', expected: '/cards/event_lookashes.png' },
  { name: 'Card Trade', expected: '/cards/event_cardtrade.png' },
  { name: 'And Then There Was One More', expected: '/cards/event_onemore.png' },
  { name: 'Delay The Murderers Escape', expected: '/cards/event_delayescape.png' },
  { name: 'Early Train To Paddington', expected: '/cards/event_earlytrain.png' },
  { name: 'Point Your Suspicions', expected: '/cards/event_pointsuspicions.png' },
  { name: 'Blackmailed', expected: '/cards/devious_blackmailed.png' },
  { name: 'Social Faux Pas', expected: '/cards/devious_fauxpas.png' },
];

describe('getCardsImage', () => {
  it('returns correct image path for all mapped card names', () => {
    TEST_CASES.forEach(({ name, expected }) => {
      expect(getCardsImage({ name })).toBe(expected);
    });
  });

  it('returns null for unmapped card names', () => {
    expect(getCardsImage({ name: 'Unknown Card' })).toBeNull();
    expect(getCardsImage({ name: 'Detective X' })).toBeNull();
  });

  it('returns null for missing or empty card object', () => {
    expect(getCardsImage(null)).toBeNull();
    expect(getCardsImage(undefined)).toBeNull();
    expect(getCardsImage({})).toBeNull();
    expect(getCardsImage({ name: '' })).toBeNull();
  });

  it('normalizes names with accents, case, and extra spaces', () => {
    expect(getCardsImage({ name: '  Hércule   Poirot  ' })).toBe('/cards/detective_poirot.png');
    expect(getCardsImage({ name: 'MISS MARPLE' })).toBe('/cards/detective_marple.png');
    expect(getCardsImage({ name: 'Lady Eileen Bundle Brént' })).toBe('/cards/detective_brent.png');
    expect(getCardsImage({ name: 'Not So Fast!' })).toBe('/cards/instant_notsofast.png');
  });
});
