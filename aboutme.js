const spaceID = "5s0o4h95n44w";
const accessToken = "x7EkFh4_24fM-0H0hKemD2k6OQY9HBU4sP7H0_ylTfs";
const entryID = "42UUKdm0E0o3JuhSF1NlU"; // AboutMe entry

// Determine locale from URL parameter, defaulting to Norwegian ("no")
const params = new URLSearchParams(window.location.search);
const locale = params.get('locale') === 'en' ? 'en-US' : 'no';

async function fetchAboutMe() {
  const url = `https://cdn.contentful.com/spaces/${spaceID}/environments/master/entries/${entryID}?access_token=${accessToken}&locale=${locale}`;
  try {
    const response = await fetch(url);
    const data = await response.json();

    if (!data.fields) {
      throw new Error("Invalid response format");
    }

    // Create container for About Me content
    const container = document.createElement("div");
    container.id = "aboutme-content";
    container.style.maxWidth = "1750px";
    container.style.margin = "0 auto";
    container.style.padding = "2rem";

    // Create two-column layout container
    const layout = document.createElement("div");
    layout.classList.add("aboutme-layout");

    // Left column: About Me Image
    const imageDiv = document.createElement("div");
    imageDiv.classList.add("aboutme-image");
    if (data.fields.image && data.fields.image.sys) {
      const assetUrl = `https://cdn.contentful.com/spaces/${spaceID}/environments/master/assets/${data.fields.image.sys.id}?access_token=${accessToken}`;
      const assetResponse = await fetch(assetUrl);
      const assetData = await assetResponse.json();
      if (assetData.fields && assetData.fields.file) {
        const imageUrl = assetData.fields.file.url.startsWith("//")
          ? "https:" + assetData.fields.file.url
          : assetData.fields.file.url;
        const img = document.createElement("img");
        img.src = imageUrl;
        img.alt = data.fields.title || "About Me Image";
        imageDiv.appendChild(img);
      }
    }

    // Right column: Title and Rich Text Body
    const textDiv = document.createElement("div");
    textDiv.classList.add("aboutme-text");

    // Render Title
    const titleEl = document.createElement("h1");
    titleEl.textContent = data.fields.title || "About Me";
    textDiv.appendChild(titleEl);

    // Render Rich Text body
    if (data.fields.body) {
      const bodyDiv = document.createElement("div");
      bodyDiv.classList.add("aboutme-body");
      bodyDiv.innerHTML = convertRichTextToHtml(data.fields.body);
      textDiv.appendChild(bodyDiv);
    }

    // Append columns to layout container
    layout.appendChild(imageDiv);
    layout.appendChild(textDiv);
    container.appendChild(layout);

    document.body.appendChild(container);
  } catch (error) {
    console.error("Error fetching AboutMe data:", error);
  }
}

// Basic Rich Text conversion (handles paragraphs only)
function convertRichTextToHtml(richTextDocument) {
  if (!richTextDocument || !richTextDocument.content) return '';
  let html = '';
  richTextDocument.content.forEach(node => {
    if (node.nodeType === 'paragraph') {
      let paragraph = '';
      node.content.forEach(child => {
        if (child.nodeType === 'text') {
          paragraph += child.value;
        }
      });
      html += `<p>${paragraph}</p>`;
    }
    // Extend to handle other node types if needed.
  });
  return html;
}

fetchAboutMe();
