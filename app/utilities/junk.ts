const generateRandomNumber = () => {
  return Math.floor(Math.random() * 1000000);
};

interface GenerateFuncTypes {
  title: string;
  range: number;
  category: string;
  image: string;
}

const generateDumyData = ({ title, range, category, image }: GenerateFuncTypes) => {
  interface ItemType {
    id: number;
    category: string;
    name: string;
    price: number;
    image: string;
  }
  const data: ItemType[] = [];
  for (let i = 1; i < range; i++) {
    const item: ItemType = {
      id: i,
      image: image,
      category: category,
      name: `${title} ${i}`,
      price: generateRandomNumber(),
    };
    data.push(item);
  }
  return data;
};

interface DumyDataTypes {
  kursus: any;
  programBerlangganan: any;
  showroom: any;
  product: any;
}

export const data: DumyDataTypes = {
  kursus: generateDumyData({
    title: "Nama Kursus",
    category: "Kursus",
    range: 10,
    image: "https://jobsdigit.com/wp-content/uploads/2022/03/BE-Course-Details.png",
  }),
  showroom: generateDumyData({
    title: "Nama Showroom",
    category: "Showroom",
    range: 10,
    image: "https://www.smartpassiveincome.com/wp-content/uploads/2020/04/How-to-Create-an-Online-Course.png",
  }),

  product: generateDumyData({
    title: "Nama Product",
    category: "Product",
    range: 10,
    image: "https://miro.medium.com/max/720/0*Sjxt24x-KL4AXghQ.webp",
  }),
  programBerlangganan: generateDumyData({
    title: "Nama Program Berlangganan",
    category: "Program Berlangganan",
    range: 10,
    image:
      "https://www.re-thinkingthefuture.com/wp-content/uploads/2021/01/A2998-10-Non-Architectural-online-courses-that-architects-should-know.jpg",
  }),
};
