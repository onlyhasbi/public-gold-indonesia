import type { GoldPrice, GoldPricesResult } from "../types";

export const getGoldPrices = async (): Promise<GoldPricesResult | null> => {
  try {
    const res = await fetch("/api-proxy/index.php");
    const htmlString = await res.text();

    const parser = new DOMParser();
    const doc = parser.parseFromString(htmlString, "text/html");

    if (!(doc instanceof Document)) {
      console.error("Failed to parse HTML document");
      return null;
    }

    const goldElements = doc.querySelectorAll("#gold_price_col");
    const poeElements = doc.querySelectorAll(
      "a[href='https://my-cdn.publicgold.com.my/image/catalog/common/liveprice/langkahlangkahmembeligapv2.pdf']",
    );

    const poePrices: GoldPrice[] = Array.from(poeElements)
      .map((el) => {
        const text = el.textContent?.trim() ?? "";
        const [price, label] = text.split("=");
        return { label: label ?? "", price: price ?? null };
      })
      .filter(({ price }) => Boolean(price));

    const goldPrices: GoldPrice[] = Array.from(goldElements).map((el) => {
      const priceElement = el.nextElementSibling;
      return {
        label: el.textContent?.trim() ?? "",
        price: priceElement?.textContent?.trim() ?? null,
      };
    });

    return {
      poe: poePrices,
      dinar: goldPrices.filter((g) => g.label.includes("Dinar")),
      goldbar: goldPrices.filter((g) => g.label.includes("gram")),
    };
  } catch (error) {
    console.error("Failed to fetch gold prices:", error);
    return null;
  }
};
