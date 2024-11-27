import { randomUUID } from "crypto";

export function parseReceipt(entities) {
  const receipt = {
    receipt_id: randomUUID(),
    date: "",
    time: "",
    store_name: "",
    store_address: "",
    total: "",
  };

  const items = [];

  entities.forEach((element) => {
    switch (element.type) {
      case "date":
        receipt.date = element.normalizedValue.text;
        break;
      case "time":
        receipt.time = element.mentionText;
        break;
      case "store_name":
        receipt.store_name = element.mentionText;
        break;
      case "store_address":
        receipt.store_address = element.mentionText;
        break;
      case "total":
        receipt.total = element.mentionText;
        break;
      case "items":
        const itemObj = {
          id: randomUUID(),
          receipt_id: receipt.receipt_id,
          code: "",
          name: "",
          quantity: "",
          price_per_unit: "",
          price: "",
          vat: "",
        };

        element.properties.forEach((itemField) => {
          switch (itemField.type) {
            case "item_code":
              itemObj.code = itemField.mentionText;
            case "item_name":
              itemObj.name = itemField.mentionText;
              break;
            case "item_quantity":
              itemObj.quantity = itemField.mentionText;
              break;
            case "item_price_per_unit":
              itemObj.price_per_unit = itemField.mentionText;
              break;
            case "item_price":
              itemObj.price = itemField.mentionText;
              break;
            case "item_vat":
              itemObj.vat = itemField.mentionText;
              break;
            default:
              console.log("Unknown item field type");
          }
        });
        items.push(itemObj);
        break;
      default:
        console.log("Unknown entity type");
    }
  });

  const flattenItems = [];
  items.forEach((item) => {
    flattenItems.push({ ...item, ...receipt });
  });
  
  return flattenItems;
}
