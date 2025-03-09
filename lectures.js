const spaceID = "5s0o4h95n44w";
const accessToken = "x7EkFh4_24fM-0H0hKemD2k6OQY9HBU4sP7H0_ylTfs";
const entryID = "6LSshaA7zTIORdvTkDzJZa"; // MainPage entry ID

// Determine locale from URL parameter, defaulting to Norwegian ("nb-NO")
const params = new URLSearchParams(window.location.search);
const locale = params.get('locale') === 'en' ? 'en-US' : 'no';

async function fetchContentfulData() {
    // Append locale to the URL
    const url = `https://cdn.contentful.com/spaces/${spaceID}/environments/master/entries/${entryID}?access_token=${accessToken}&locale=${locale}`;
    try {
        const response = await fetch(url);
        const data = await response.json();

        if (!data.fields) {
            throw new Error("Invalid response format");
        }

        // Render banner fields
        document.getElementById("title").textContent = data.fields.title || "No Title Available";
        document.getElementById("ingress").textContent = data.fields.ingress || "";
        
        // Render banner image
        if (data.fields.bannerImage && data.fields.bannerImage.sys) {
            const assetUrl = `https://cdn.contentful.com/spaces/${spaceID}/environments/master/assets/${data.fields.bannerImage.sys.id}?access_token=${accessToken}`;
            const assetResponse = await fetch(assetUrl);
            const assetData = await assetResponse.json();
            if (assetData.fields && assetData.fields.file) {
                const imageUrl = assetData.fields.file.url.startsWith("//")
                    ? "https:" + assetData.fields.file.url
                    : assetData.fields.file.url;
                const bannerImg = document.getElementById("banner");
                bannerImg.src = imageUrl;
                bannerImg.style.display = "block";
            }
        }

        // Process the "content" array in order
        if (data.fields.content && data.fields.content.length > 0) {
            for (let item of data.fields.content) {
                // Append locale to each entry request
                const entryUrl = `https://cdn.contentful.com/spaces/${spaceID}/environments/master/entries/${item.sys.id}?access_token=${accessToken}&locale=${locale}`;
                const entryResponse = await fetch(entryUrl);
                const entryData = await entryResponse.json();

                switch (entryData.sys.contentType.sys.id) {
                    case "quote":
                        // Render Quote content
                        const quoteDiv = document.createElement("div");
                        quoteDiv.classList.add("quote");

                        const quoteP = document.createElement("p");
                        quoteP.textContent = entryData.fields.quote;
                        quoteDiv.appendChild(quoteP);

                        const sourceP = document.createElement("p");
                        sourceP.textContent = entryData.fields.source;
                        sourceP.classList.add("quote-source");
                        quoteDiv.appendChild(sourceP);

                        document.getElementById("quote-container").appendChild(quoteDiv);
                        break;

                    case "contentCard":
                        // Render ContentCard content
                        const cardDiv = document.createElement("div");
                        cardDiv.classList.add("content-card");
                    
                        // Text container (left)
                        const textDiv = document.createElement("div");
                        textDiv.classList.add("card-text");
                    
                        const titleH2 = document.createElement("h2");
                        titleH2.textContent = entryData.fields.title;
                        textDiv.appendChild(titleH2);
                    
                        const shortTextP = document.createElement("p");
                        shortTextP.textContent = entryData.fields.shortText;
                        textDiv.appendChild(shortTextP);
                    
                        // Add button below shortText if link exists
                        if (entryData.fields.link) {
                            const linkButton = document.createElement("a");
                            linkButton.textContent = "Read More";
                            linkButton.href = entryData.fields.link;
                            linkButton.classList.add("card-button");
                            linkButton.target = "_blank";
                            textDiv.appendChild(linkButton);
                        }
                    
                        // Image container (right)
                        const imageDiv = document.createElement("div");
                        imageDiv.classList.add("card-image");
                    
                        if (entryData.fields.image && entryData.fields.image.sys) {
                            const assetUrl = `https://cdn.contentful.com/spaces/${spaceID}/environments/master/assets/${entryData.fields.image.sys.id}?access_token=${accessToken}`;
                            const assetResponse = await fetch(assetUrl);
                            const assetData = await assetResponse.json();
                            if (assetData.fields && assetData.fields.file) {
                                const imageUrl = assetData.fields.file.url.startsWith("//")
                                    ? "https:" + assetData.fields.file.url
                                    : assetData.fields.file.url;
                                const img = document.createElement("img");
                                img.src = imageUrl;
                                img.alt = entryData.fields.title || "Content Card Image";
                                imageDiv.appendChild(img);
                            }
                        }
                    
                        cardDiv.appendChild(textDiv);
                        cardDiv.appendChild(imageDiv);
                        document.getElementById("quote-container").appendChild(cardDiv);
                        break;

                        case "infoContent":
                            // Create container for info content
                            const infoDiv = document.createElement("div");
                            infoDiv.classList.add("info-content");

                            // Create title element (left)
                            const infoTitle = document.createElement("div");
                            infoTitle.classList.add("info-title");
                            infoTitle.textContent = entryData.fields.title || "No Title Available";

                            // Create shortText element (right)
                            const infoShortText = document.createElement("div");
                            infoShortText.classList.add("info-shortText");
                            infoShortText.textContent = entryData.fields.shortText || "";

                            // Append title and shortText to container
                            infoDiv.appendChild(infoTitle);
                            infoDiv.appendChild(infoShortText);

                            // Append the infoDiv to the main container
                            document.getElementById("quote-container").appendChild(infoDiv);
                        break;

                    default:
                        // Optionally handle additional content types here
                        break;
                }
            }
        }
    } catch (error) {
        console.error("Error fetching Contentful data:", error);
        document.getElementById("title").textContent = "Error loading content";
    }
}

fetchContentfulData();
