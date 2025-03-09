const spaceID = "5s0o4h95n44w";
const accessToken = "x7EkFh4_24fM-0H0hKemD2k6OQY9HBU4sP7H0_ylTfs";

// Determine locale from URL parameter, defaulting to Norwegian ("no")
const params = new URLSearchParams(window.location.search);
const locale = params.get('locale') === 'en' ? 'en-US' : 'no';

async function fetchBlogPosts() {
  // Fetch all blog posts sorted by latest created (descending)
  const url = `https://cdn.contentful.com/spaces/${spaceID}/environments/master/entries?access_token=${accessToken}&content_type=blogPost&order=-sys.createdAt&locale=${locale}&include=1`;
  try {
    const response = await fetch(url);
    const data = await response.json();

    if (!data.items || data.items.length === 0) {
      throw new Error("No blog posts found");
    }

    // Create container for blog posts
    const container = document.createElement("div");
    container.id = "blog-posts";
    container.style.maxWidth = "1750px";
    container.style.margin = "0 auto";
    container.style.padding = "2rem";

    // Helper: Get asset URL from includes
    function getAssetUrl(assetId) {
      if (data.includes && data.includes.Asset) {
        const asset = data.includes.Asset.find(asset => asset.sys.id === assetId);
        if (asset && asset.fields && asset.fields.file) {
          return asset.fields.file.url.startsWith("//")
            ? "https:" + asset.fields.file.url
            : asset.fields.file.url;
        }
      }
      return null;
    }

    // Loop through each blog post entry and create a card
    data.items.forEach(item => {
      const fields = item.fields;
      const card = document.createElement("div");
      card.classList.add("blog-card");

      // Create image container (left column)
      const imageContainer = document.createElement("div");
      imageContainer.classList.add("blog-card-image");
      if (fields.image && fields.image.sys) {
        const imageId = fields.image.sys.id;
        const imageUrl = getAssetUrl(imageId);
        if (imageUrl) {
          const img = document.createElement("img");
          img.src = imageUrl;
          img.alt = fields.title || "Blog Post Image";
          imageContainer.appendChild(img);
        }
      }
      card.appendChild(imageContainer);

      // Create text container (right column)
      const textContainer = document.createElement("div");
      textContainer.classList.add("blog-card-text");

      // Title
      const titleEl = document.createElement("h2");
      titleEl.textContent = fields.title || "No Title";
      textContainer.appendChild(titleEl);

      // Teaser Text
      const teaserEl = document.createElement("p");
      teaserEl.textContent = fields.teaserText || "";
      textContainer.appendChild(teaserEl);

      // "Les mer" Button
      const readMoreButton = document.createElement("a");
      readMoreButton.textContent = "Les mer";
      readMoreButton.classList.add("read-more-btn");
      // Append the blog post's entry ID as a query parameter
      readMoreButton.href = `blogpost.html?entryId=${item.sys.id}`;
      textContainer.appendChild(readMoreButton);

      card.appendChild(textContainer);
      container.appendChild(card);
    });

    document.body.appendChild(container);
  } catch (error) {
    console.error("Error fetching Blog Posts:", error);
  }
}

fetchBlogPosts();
