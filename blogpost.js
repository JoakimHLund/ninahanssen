const spaceID = "5s0o4h95n44w";
const accessToken = "x7EkFh4_24fM-0H0hKemD2k6OQY9HBU4sP7H0_ylTfs";

// Read entryId and locale from URL parameters
const params = new URLSearchParams(window.location.search);
const entryId = params.get('entryId');
const locale = params.get('locale') === 'en' ? 'en-US' : 'no';

async function fetchBlogPost() {
  if (!entryId) {
    console.error("No entryId provided in query parameters.");
    return;
  }

  const url = `https://cdn.contentful.com/spaces/${spaceID}/environments/master/entries/${entryId}?access_token=${accessToken}&locale=${locale}&include=1`;

  try {
    const response = await fetch(url);
    const data = await response.json();
    if (!data.fields) {
      throw new Error("Invalid response format");
    }

    // Create a container for the blog post content
    const container = document.createElement("div");
    container.id = "blogpost-content";

    // Render Title at the top
    const titleEl = document.createElement("h1");
    titleEl.textContent = data.fields.title || "Blog Post";
    container.appendChild(titleEl);

    // Render Image below the title
    if (data.fields.image && data.fields.image.sys) {
      let imageUrl = null;
      // Try to get the asset URL from includes; if not available, fetch it directly.
      if (data.includes && data.includes.Asset) {
        imageUrl = getAssetUrl(data.fields.image.sys.id, data);
      } else {
        imageUrl = await fetchAssetUrl(data.fields.image.sys.id);
      }
      if (imageUrl) {
        const img = document.createElement("img");
        img.src = imageUrl;
        img.alt = data.fields.title || "Blog Post Image";
        container.appendChild(img);
      }
    }

    // Render Rich Text body below the image
    if (data.fields.body) {
      const bodyContainer = document.createElement("div");
      bodyContainer.innerHTML = convertRichTextToHtml(data.fields.body);
      container.appendChild(bodyContainer);
    }

    document.body.appendChild(container);
  } catch (error) {
    console.error("Error fetching blog post:", error);
  }
}

// Helper to retrieve asset URL from data.includes (if available)
function getAssetUrl(assetId, data) {
  if (data.includes && data.includes.Asset) {
    const asset = data.includes.Asset.find(asset => asset.sys.id === assetId);
    if (asset && asset.fields && asset.fields.file) {
      const url = asset.fields.file.url;
      return url.startsWith("//") ? "https:" + url : url;
    }
  }
  return null;
}

// Fallback helper: fetch the asset directly if data.includes is missing
async function fetchAssetUrl(assetId) {
  const assetUrl = `https://cdn.contentful.com/spaces/${spaceID}/environments/master/assets/${assetId}?access_token=${accessToken}`;
  try {
    const response = await fetch(assetUrl);
    const assetData = await response.json();
    if (assetData.fields && assetData.fields.file) {
      const url = assetData.fields.file.url;
      return url.startsWith("//") ? "https:" + url : url;
    }
  } catch (error) {
    console.error("Error fetching asset:", error);
  }
  return null;
}

function convertRichTextToHtml(richTextDocument) {
    if (!richTextDocument || !richTextDocument.content) return '';
  
    let html = '';
  
    richTextDocument.content.forEach(node => {
      if (node.nodeType === 'paragraph') {
        let paragraph = '';
  
        node.content.forEach(child => {
          if (child.nodeType === 'text') {
            let text = child.value;
  
            if (child.marks) {
              child.marks.forEach(mark => {
                if (mark.type === 'bold') {
                  text = `<strong>${text}</strong>`;
                }
                if (mark.type === 'italic') {
                  text = `<em>${text}</em>`;
                }
                if (mark.type === 'underline') {
                  text = `<u>${text}</u>`;
                }
              });
            }
  
            paragraph += text;
          } else if (child.nodeType === 'hyperlink') {
            const url = child.data.uri;
            let linkText = '';
            
            child.content.forEach(linkChild => {
              if (linkChild.nodeType === 'text') {
                linkText += linkChild.value;
              }
            });
  
            paragraph += `<a href="${url}" target="_blank" rel="noopener noreferrer">${linkText}</a>`;
          }
        });
  
        html += `<p>${paragraph}</p>`;
      }
    });
  
    return html;
  }
  
fetchBlogPost();
