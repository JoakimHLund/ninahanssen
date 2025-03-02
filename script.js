const spaceID = "5s0o4h95n44w";
const accessToken = "x7EkFh4_24fM-0H0hKemD2k6OQY9HBU4sP7H0_ylTfs";
const entryID = "74KRGoL6oJaaS9gaaSUYYN"; // MainPage entry ID

async function fetchContentfulData() {
    const url = `https://cdn.contentful.com/spaces/${spaceID}/environments/master/entries/${entryID}?access_token=${accessToken}`;

    try {
        const response = await fetch(url);
        const data = await response.json();

        if (!data.fields) {
            throw new Error("Invalid response format");
        }

        document.getElementById("title").textContent = data.fields.title || "No Title Available";
        document.getElementById("ingress").textContent = data.fields.ingress || "";

        if (data.fields.bannerImage && data.fields.bannerImage.sys) {
            const assetUrl = `https://cdn.contentful.com/spaces/${spaceID}/environments/master/assets/${data.fields.bannerImage.sys.id}?access_token=${accessToken}`;
            const assetResponse = await fetch(assetUrl);
            const assetData = await assetResponse.json();
            
            if (assetData.fields && assetData.fields.file) {
                const imageUrl = assetData.fields.file.url.startsWith("//") ? "https:" + assetData.fields.file.url : assetData.fields.file.url;
                const bannerImg = document.getElementById("banner");
                bannerImg.src = imageUrl;
                bannerImg.style.display = "block";
            }
        }
    } catch (error) {
        console.error("Error fetching Contentful data:", error);
        document.getElementById("title").textContent = "Error loading content";
    }
}

fetchContentfulData();
