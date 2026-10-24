import { describe, expect, it } from 'vitest'
import { claims } from './claims'
import { eventDetails } from './event-details'
import { eventTimeReview } from './event-time-review'
import { events } from './events'
import { heritageDetails } from './heritage-details'
import { heritageAssets } from './heritage'
import { people } from './people'
import { personDetails } from './person-details'
import { polityDetails } from './polity-details'
import { sourceById } from './sources'

describe('wu_three termination closure', () => {
  it('closes the 280 event, participants, polities, sources, and time audit', () => {
    const event = events.find((item) => item.id === 'jin-unification')
    const detail = eventDetails.find((item) => item.eventId === 'jin-unification')
    const review = eventTimeReview.find((item) => item.eventId === 'jin-unification')
    expect(event).toMatchObject({ year: 280, placeId: 'jiankang', datePrecision: 'year', category: '政权终止／政权承接' })
    expect(detail?.polityIds).toEqual(expect.arrayContaining(['wu_three', 'jin_western']))
    expect(detail?.locationIds).toContain('jiankang')
    expect(detail?.participants.map((item) => item.personId)).toEqual(expect.arrayContaining(['sun-hao', 'sima-yan']))
    expect(review).toMatchObject({ status: 'confirmed', expectedPrecision: 'year', timelineStrategy: 'year-marker' })
    for (const sourceId of [...(event?.sourceIds ?? []), ...(detail?.sourceIds ?? [])]) expect(sourceById[sourceId]).toBeDefined()
  })

  it('links the Wu capital phase to the Jiankang heritage and Jin succession', () => {
    const wu = polityDetails.find((item) => item.polityId === 'wu_three')
    const heritage = heritageDetails.find((item) => item.heritageId === 'jiankang-six-dynasties-city-site')
    const asset = heritageAssets.find((item) => item.id === 'jiankang-six-dynasties-city-site')
    expect(wu?.capitalPhases).toEqual(expect.arrayContaining([expect.objectContaining({ placeId: 'jiankang', validFrom: 222, validTo: 280 })]))
    expect(wu?.eventIds).toContain('jin-unification')
    expect(asset?.placeId).toBe('jiankang')
    expect(heritage?.associatedEvents).toContain('jin-unification')
    expect(heritage?.associatedPolities).toEqual(expect.arrayContaining(['wu_three', 'jin_western']))
    expect(heritage?.associatedPeople).toContain('sun-hao')
  })

  it('defines Sun Hao and all closure claims without isolated references', () => {
    const person = people.find((item) => item.id === 'sun-hao')
    const detail = personDetails.find((item) => item.personId === 'sun-hao')
    expect(person).toMatchObject({ name: '孙皓', polityIds: ['wu_three'] })
    expect(detail?.keyEvents).toContain('jin-unification')
    for (const id of ['claim-sun-hao-ruled-wu-three', 'claim-sun-hao-participated-jin-unification', 'claim-sun-hao-submitted-to-sima-yan-jin-unification', 'claim-sima-yan-participated-jin-unification-fortyfourth']) expect(claims.find((claim) => claim.id === id)).toBeDefined()
    const ids = new Set(claims.map((claim) => claim.id))
    for (const polity of polityDetails.filter((item) => ['wu_three', 'jin_western'].includes(item.polityId))) {
      for (const claimId of polity.claimIds) expect(ids.has(claimId)).toBe(true)
      for (const eventId of polity.eventIds) expect(events.some((event) => event.id === eventId)).toBe(true)
    }
    for (const participant of eventDetails.find((item) => item.eventId === 'jin-unification')?.participants ?? []) expect(people.some((person) => person.id === participant.personId)).toBe(true)
  })
})
