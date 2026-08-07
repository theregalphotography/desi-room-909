/**
 * Adds the "Upcoming Teaser" content type — non-bookable "coming soon" cards
 * shown on Home ("Next Editions") and Events ("More On The Way") for rooms
 * that don't have a confirmed date/venue in Eventbrite yet.
 *
 * Run with:
 *   npx contentful-migration --space-id <SPACE_ID> --environment-id master \
 *     --access-token <CMA_TOKEN> --yes \
 *     contentful/migrations/002-upcoming-teaser.js
 *
 * The script path is a positional argument, not a flag.
 */
module.exports = function (migration) {
  const upcomingTeaser = migration.createContentType("upcomingTeaser", {
    name: "Upcoming Teaser",
    description:
      "A 'coming soon' room without a confirmed date yet. No booking, no exact date — just a name, a poster, and a rough sense of when. Once the room is confirmed and published in Eventbrite, unpublish or delete this entry.",
    displayField: "title",
  });

  upcomingTeaser.createField("title", {
    name: "Title",
    type: "Symbol",
    required: true,
  });

  upcomingTeaser
    .createField("timing", {
      name: "Timing",
      type: "Symbol",
      required: true,
    })
    .validations([{ size: { max: 40 } }]);
  upcomingTeaser.changeFieldControl("timing", "builtin", "singleLine", {
    helpText: "Fuzzy timing only, e.g. \"COMING THIS FALL\" or \"OCTOBER\" — never an exact bookable date.",
  });

  upcomingTeaser.createField("poster", {
    name: "Poster",
    type: "Link",
    linkType: "Asset",
    required: true,
    validations: [{ linkMimetypeGroup: ["image"] }],
  });

  upcomingTeaser.createField("order", {
    name: "Display Order",
    type: "Integer",
    required: false,
  });
  upcomingTeaser.changeFieldControl("order", "builtin", "numberEditor", {
    helpText: "Lower numbers show first. Leave blank to show after all ordered entries, in creation order.",
  });
};
