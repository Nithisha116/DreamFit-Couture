const garmentFromApi = {
  referenceImages: [
    {
      "url": "https://pub-a1bee19c06d549fea9e2f18f551ef841.r2.dev/orders/69f5db89d924a59188deeadb/garment_0/reference/1777720202650-1c56f5fb.jpeg",
      "key": "orders/69f5db89d924a59188deeadb/garment_0/reference/1777720202650-1c56f5fb.jpeg"
    }
  ]
};

// Simulate GarmentForm processExistingImage
const processExistingImage = (img) => {
  const isFile = img instanceof File;
  let previewUrl;
  try {
    previewUrl = isFile ? URL.createObjectURL(img) : (img.url || img);
  } catch (e) {
    previewUrl = img.url || img;
  }
  return {
    preview: previewUrl,
    file: isFile ? img : null,
    isExisting: !isFile,
    url: isFile ? null : (img.url || img),
    key: isFile ? null : img.key,
  };
};

const studioPreviews = garmentFromApi.referenceImages.map(processExistingImage);

const existingRefKeys = [];
for (const imgObj of studioPreviews) {
  if (imgObj && imgObj.isExisting) {
    if (imgObj.key) existingRefKeys.push(imgObj.key);
    else if (imgObj.url) existingRefKeys.push(imgObj.url);
  }
}

const reqBody = {
  existingReferenceImages: JSON.stringify(existingRefKeys)
};

console.log("Req Body sent from frontend:", reqBody);

// Simulate Backend Parse
let keepReferenceKeys = [];
if (reqBody.existingReferenceImages && typeof reqBody.existingReferenceImages === 'string') {
  keepReferenceKeys = JSON.parse(reqBody.existingReferenceImages);
}

console.log("Parsed keepReferenceKeys:", keepReferenceKeys);

// Simulate DB filter
let garmentDbRefImages = [
  {
    "url": "https://pub-a1bee19c06d549fea9e2f18f551ef841.r2.dev/orders/69f5db89d924a59188deeadb/garment_0/reference/1777720202650-1c56f5fb.jpeg",
    "key": "orders/69f5db89d924a59188deeadb/garment_0/reference/1777720202650-1c56f5fb.jpeg"
  }
];

if (keepReferenceKeys.length > 0) {
  garmentDbRefImages = garmentDbRefImages.filter(img => 
    keepReferenceKeys.includes(img.key)
  );
} else {
  garmentDbRefImages = [];
}

console.log("Final DB refImages:", garmentDbRefImages);
