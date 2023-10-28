import * as dynamoose from "dynamoose";
import { Item } from "dynamoose/dist/Item";

// Create new DynamoDB instance
const ddb = new dynamoose.aws.ddb.DynamoDB({
  credentials: {
    accessKeyId: process.env.ID,
    secretAccessKey: process.env.SECRET,
  },
  region: process.env.REGION,
});

// Set DynamoDB instance to the Dynamoose DDB instance
dynamoose.aws.ddb.set(ddb);

class Link extends Item {
  shortLink!: string;
  longLink!: string;
}

const LinkModel = dynamoose.model<Link>("Link", {
  shortLink: {
    type: String,
  },
  longLink: String,
});

export const createLink = async (newLink: {
  shortLink: string;
  longLink: string;
}) => {
  const link = new LinkModel({
    shortLink: newLink.shortLink,
    longLink: newLink.longLink,
  });

  await link.save();
  return link;
};

export const getLongLink = async (shortLink: string) => {
  const link = await LinkModel.get(shortLink);
  return link.longLink;
};
