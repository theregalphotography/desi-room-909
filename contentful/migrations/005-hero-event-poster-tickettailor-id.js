/**
 * Ticketing moved from Eventbrite to Ticket Tailor. Relabels the
 * `heroEventPoster.eventId` field so editors enter Ticket Tailor event IDs
 * (e.g. "ev_1234567") instead of Eventbrite ones. Field ID is unchanged, so
 * no app code depends on this — it only updates names and help text.
 *
 * After running, re-enter `eventId` on every existing entry that had an
 * Eventbrite ID; until then those posters fall back to the event's own
 * Ticket Tailor image. Entries with `eventId` blank keep working as the
 * default override for the soonest event.
 *
 * Run with:
 *   npx contentful-migration --space-id <SPACE_ID> --environment-id master \
 *     --access-token <CMA_TOKEN> --yes \
 *     contentful/migrations/005-hero-event-poster-tickettailor-id.js
 *
 * The script path is a positional argument, not a flag.
 */
module.exports = function (migration) {
  const heroEventPoster = migration.editContentType("heroEventPoster", {
    description:
      "Poster image override(s) for Home's 'Happening Next' event(s). Leave `eventId` blank to override whichever event shows first/soonest; set it to a specific Ticket Tailor event ID to target that event when two are shown side by side.",
  });

  heroEventPoster.editField("eventId", {
    name: "Ticket Tailor Event ID",
  });
  heroEventPoster.changeFieldControl("eventId", "builtin", "singleLine", {
    helpText:
      "Leave blank to override whichever event shows first/soonest. Otherwise enter the Ticket Tailor event ID (starts with \"ev_\", shown in the event's URL in the Ticket Tailor dashboard) to target that exact event.",
  });

  const upcomingTeaser = migration.editContentType("upcomingTeaser", {
    description:
      "A 'coming soon' room without a confirmed date yet. No booking, no exact date — just a name, a poster, and a rough sense of when. Once the room is confirmed and published in Ticket Tailor, unpublish or delete this entry.",
  });
};
