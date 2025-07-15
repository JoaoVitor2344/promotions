const axios = require("axios");
const crypto = require("crypto");
const dotenv = require("dotenv");
dotenv.config();

const AMAZON_ACCESS_KEY = process.env.AMAZON_ACCESS_KEY;
const AMAZON_SECRET_KEY = process.env.AMAZON_SECRET_KEY;
const AMAZON_ASSOCIATE_TAG = process.env.AMAZON_ASSOCIATE_TAG;
const AMAZON_REGION = "us-east-1";
const AMAZON_HOST = "webservices.amazon.com";
const AMAZON_API_URI = "/paapi5/searchitems";

function getSignedHeaders(payload, timestamp) {
  // Monta headers para assinatura AWS V4
  return {
    "content-encoding": "amz-1.0",
    "content-type": "application/json; charset=UTF-8",
    host: AMAZON_HOST,
    "x-amz-date": timestamp,
    "x-amz-target": "com.amazon.paapi5.v1.ProductAdvertisingAPIv1.SearchItems",
  };
}

function getSignature(payload, timestamp) {
  // Função simplificada para assinatura AWS V4 (para produção, use lib oficial ou AWS SDK)
  // Aqui só estrutura, pois assinatura real é complexa
  return "";
}

async function fetchAmazonPromotions({ keyword = "promo", page = 1 }) {
  if (!AMAZON_ACCESS_KEY || !AMAZON_SECRET_KEY || !AMAZON_ASSOCIATE_TAG) {
    throw new Error("Credenciais da Amazon não configuradas no .env");
  }
  const timestamp =
    new Date().toISOString().replace(/[-:]/g, "").replace(/\..+/, "") + "Z";
  const payload = {
    Keywords: keyword,
    SearchIndex: "All",
    ItemCount: 5,
    Resources: [
      "Images.Primary.Large",
      "ItemInfo.Title",
      "Offers.Listings.Price",
      "ItemInfo.Features",
      "DetailPageURL",
    ],
    PartnerTag: AMAZON_ASSOCIATE_TAG,
    PartnerType: "Associates",
    Marketplace: "www.amazon.com.br",
    ItemPage: page,
  };
  const headers = getSignedHeaders(payload, timestamp);
  // headers.Authorization = getSignature(payload, timestamp); // Assinatura real

  try {
    const response = await axios.post(
      `https://${AMAZON_HOST}${AMAZON_API_URI}`,
      payload,
      { headers }
    );
    if (!response.data.SearchResult || !response.data.SearchResult.Items)
      return [];
    return response.data.SearchResult.Items.map((item) => ({
      title: item.ItemInfo?.Title?.DisplayValue || "",
      description: (item.ItemInfo?.Features?.DisplayValues || []).join(" "),
      url: item.DetailPageURL,
      imageUrl: item.Images?.Primary?.Large?.URL || "",
    }));
  } catch (err) {
    console.error("Erro na Amazon API:", err.response?.data || err.message);
    return [];
  }
}

module.exports = { fetchAmazonPromotions };
