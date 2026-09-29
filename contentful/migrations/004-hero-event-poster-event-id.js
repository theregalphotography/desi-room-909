/**
 * Adds an optional `eventId` field to the existing "Hero Event Poster"
 * content type, so it can hold more than one entry once Home shows two
 * published Eventbrite events side by side instead of just one.
 *
 * `eventId` must match the Eventbrite event's own ID (the same value used
 * everywhere else in the app as `EventbriteEvent.id`, e.g. what
 * `TicketWidget` passes as `eventId`) — find it in the event's Eventbrite
 * manage URL: eventbrite.com/manage/events/<EVENT_ID>/details.
 *
 * An entry with `eventId` left blank keeps working exactly as before: the
 * app treats it as the "default" override for whichever event is shown
 * first/soonest. Leave it blank on the existing entry — no changes needed
 * there. To add a poster for a second event, publish a new entry with
 * `eventId` set to that event's Eventbrite ID.
 *
 * Run with:
 *   npx contentful-migration --space-id <SPACE_ID> --environment-id master \
 *     --access-token <CMA_TOKEN> --yes \
 *     contentful/migrations/004-hero-event-poster-event-id.js
 *
 * The script path is a positional argument, not a flag.
 */
module.exports = function (migration) {
  const heroEventPoster = migration.editContentType("heroEventPoster", {
    description:
      "Poster image override(s) for Home's 'Happening Next' event(s). Leave `eventId` blank to override whichever event shows first/soonest (legacy single-event behavior); set it to a specific Eventbrite event ID to target that event once two are shown side by side.",
  });

  heroEventPoster.createField("eventId", {
    name: "Eventbrite Event ID",
    type: "Symbol",
    required: false,
  });
  heroEventPoster.changeFieldControl("eventId", "builtin", "singleLine", {
    helpText:
      "Leave blank to override whichever event shows first/soonest. Set to a specific Eventbrite event ID (from eventbrite.com/manage/events/<EVENT_ID>/details) to target that exact event when two are shown side by side.",
  });
};
