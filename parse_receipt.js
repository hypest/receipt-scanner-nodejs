import { randomUUID } from "crypto";

function parseCommaFloat(value) {
  return parseFloat(value.replace(",", "."));
}

function combineDateTime(dateStr, timeStr) {
  const dateTimeStr = `${dateStr} ${timeStr}`;
  const dateObj = new Date(dateTimeStr);
  return Math.floor(dateObj.getTime() / 1000).toString();
}

export function parseReceipt(entities) {
  const receipt = {
    receipt_id: randomUUID(),
    timestamp: "",
    store_name: "",
    store_address: "",
    total: "",
  };

  const items = [];
  var dateStr = "";
  var timeStr = "";

  entities.forEach((element) => {
    switch (element.type) {
      case "date":
        dateStr = element.normalizedValue.text;
        receipt.timestamp = combineDateTime(dateStr, timeStr);
        break;
      case "time":
        timeStr = element.mentionText;
        receipt.timestamp = combineDateTime(dateStr, timeStr);
        break;
      case "store_name":
        receipt.store_name = element.mentionText;
        break;
      case "store_address":
        receipt.store_address = element.mentionText;
        break;
      case "total":
        receipt.total = parseCommaFloat(element.mentionText);
        break;
      case "items":
        const itemObj = {
          id: randomUUID(),
          receipt_id: receipt.receipt_id,
          code: "",
          name: "",
          quantity: 0,
          price_per_unit: 0,
          price: 0,
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
              itemObj.quantity = parseCommaFloat(itemField.mentionText);
              break;
            case "item_price_per_unit":
              itemObj.price_per_unit = parseCommaFloat(itemField.mentionText);
              break;
            case "item_price":
              itemObj.price = parseCommaFloat(itemField.mentionText);
              break;
            case "item_vat":
              itemObj.vat = itemField.mentionText;
              break;
            default:
              console.log("Unknown item field type");
          }
        });

        if (itemObj.quantity === 0) {
          itemObj.quantity = 1;
          itemObj.price_per_unit = itemObj.price;
        }

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
