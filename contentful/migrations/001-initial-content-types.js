/**
 * Creates the two content types this app reads from lib/contentful.ts.
 * Field IDs here must match the `fields.*` keys read in that file exactly.
 *
 * Run with:
 *   npx contentful-migration --space-id <SPACE_ID> --environment-id master \
 *     --content-file contentful/migrations/001-initial-content-types.js
 *
 * Requires a Content Management API token, e.g. via `npx contentful login`,
 * or pass one directly with --management-token <CMA_TOKEN>.
 */
module.exports = function (migration) {
  const eventGallery = migration.createContentType("eventGallery", {
    name: "Event Gallery",
    description:
      "One entry per past event's full photo set, shown on the Gallery page. Create one entry per event and upload that night's photos into the Photos field.",
    displayField: "title",
  });

  eventGallery
    .createField("title", {
      name: "Title",
      type: "Symbol",
      required: true,
    })
    .validations([{ size: { max: 100 } }]);

  eventGallery.createField("eventReference", {
    name: "Event Reference",
    type: "Symbol",
    required: false,
  });
  eventGallery.changeFieldControl("eventReference", "builtin", "singleLine", {
    helpText:
      "Free text to note which Eventbrite event this gallery belongs to (e.g. event name or date). Not used for automatic matching — for editorial reference only.",
  });

  eventGallery.createField("eventDate", {
    name: "Event Date",
    type: "Date",
    required: true,
  });
  eventGallery.changeFieldControl("eventDate", "builtin", "datePicker", {
    helpText: "Drives sort order (most recent first) and the displayed month/year label.",
  });

  eventGallery
    .createField("photos", {
      name: "Photos",
      type: "Array",
      items: {
        type: "Link",
        linkType: "Asset",
        validations: [{ linkMimetypeGroup: ["image"] }],
      },
      required: true,
    });
  eventGallery.changeFieldControl("photos", "builtin", "assetGalleryEditor");

  const aboutPage = migration.createContentType("aboutPage", {
    name: "About Page",
    description:
      "Singleton entry for the About page brand story. Only one entry should ever be published — the app always reads the first one it finds.",
    displayField: "heading",
  });

  aboutPage.createField("heading", {
    name: "Heading",
    type: "Text",
    required: true,
  });
  aboutPage.changeFieldControl("heading", "builtin", "multipleLine", {
    helpText: "Rendered with a literal line break preserved — put a newline where the headline should wrap (e.g. \"A ROOM,\\nNOT A VENUE\").",
  });

  aboutPage.createField("story", {
    name: "Story",
    type: "Text",
    required: true,
  });
  aboutPage.changeFieldControl("story", "builtin", "multipleLine", {
    helpText: "Separate paragraphs with a blank line — each becomes its own paragraph on the page.",
  });
};
