/**
 * Adds the "Hero Event Poster" content type — a singleton entry (same
 * pattern as "About Page") that overrides the poster image on the Home
 * "Happening Next" hero without touching Eventbrite. Every other hero detail
 * (name, date, venue, tickets) still comes from Eventbrite as normal.
 *
 * The hero only ever shows one event at a time, so there's no ID matching —
 * the app just reads whichever entry is published. Client must update (or
 * unpublish) this entry when the featured event changes, same as
 * `upcomingTeaser`.
 *
 * Run with:
 *   npx contentful-migration --space-id <SPACE_ID> --environment-id master \
 *     --access-token <CMA_TOKEN> --yes \
 *     contentful/migrations/003-hero-event-poster.js
 *
 * The script path is a positional argument, not a flag.
 */
module.exports = function (migration) {
  const heroEventPoster = migration.createContentType("heroEventPoster", {
    name: "Hero Event Poster",
    description:
      "Singleton entry that overrides the poster image on the Home 'Happening Next' hero. Only one entry should ever be published — the app always reads the first one it finds. Update or unpublish this when the featured event changes.",
  });

  heroEventPoster.createField("poster", {
    name: "Poster",
    type: "Link",
    linkType: "Asset",
    required: true,
    validations: [{ linkMimetypeGroup: ["image"] }],
  });
};
