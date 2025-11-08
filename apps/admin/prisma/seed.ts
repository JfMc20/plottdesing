import { PrismaClient } from '@prisma/client'
import { nanoid } from 'nanoid'

function getRandomFloat(min, max, precision) {
   if (min >= max || precision < 0) {
      throw new Error(
         'Invalid input: min should be less than max and precision should be non-negative.'
      )
   }

   const range = max - min
   const randomValue = Math.random() * range + min

   return parseFloat(randomValue.toFixed(precision))
}

function getRandomIntInRange(min: number, max: number) {
   return Math.floor(Math.random() * (max - min) + min)
}

function getRandomDate(start, end) {
   return new Date(
      start.getTime() + Math.random() * (end.getTime() - start.getTime())
   )
}

function getRandomBoolean() {
   return getRandomIntInRange(0, 2) == 0 ? false : true
}

const prisma = new PrismaClient()

async function main() {
   let createdProducts = [],
      createdProviders = []

   const providers = ['Parsian', 'Pasargad', 'Dey']

   const owners = ['sesto@post.com']

   const categories = [
      'Electronics',
      'Clothing',
      'Books',
      'Home & Kitchen',
      'Toys',
      'Jewelery',
      'Accessories',
   ]

   const products = [
      {
         title: 'BKID Pipe',
         brand: 'BKID',
         categories: ['Accessories'],
         keywords: ['pipe', 'brushed', 'wood'],
         price: 69.99,
         images: ['https://lemanoosh.com/app/uploads/bkid-pipe-01.jpg'],
      },
      {
         title: 'Bang and Olufsen Speaker',
         brand: 'Bang and Olufsen',
         categories: ['Electronics'],
         keywords: ['speaker', 'brushed', 'mechanical'],
         price: 9.99,
         images: [
            'https://lemanoosh.com/app/uploads/BO_2019_A1_Natural_Brushed_05-768x1156.jpg',
         ],
      },
      {
         title: 'Audio Technica Turn-table',
         brand: 'Audio Technica',

         categories: ['Electronics'],
         keywords: ['music', 'brushed', 'mechanical'],
         price: 12.99,
         images: [
            'https://lemanoosh.com/app/uploads/gerhardt-kellermann-zeitmagazin-10.jpg',
         ],
      },
      {
         title: 'Monocle Sneakers',
         brand: 'Monocle',

         categories: ['Electronics'],
         keywords: ['shoes', 'brushed', 'mechanical'],
         price: 1.99,
         images: [
            'https://lemanoosh.com/app/uploads/plp-women-footwear-sneakers-04-07-768x1246.jpg',
         ],
      },
      {
         title: 'Zone2 Mens Watch',
         brand: 'Zone2',

         categories: ['Electronics'],
         keywords: ['shoes', 'brushed', 'mechanical'],
         price: 129.99,
         images: ['https://lemanoosh.com/app/uploads/0055-768x1023.jpg'],
      },
      {
         title: 'Carl Hauser L1 Phone',
         brand: 'Carl Hauser',
         categories: ['Electronics'],
         keywords: ['shoes', 'brushed', 'mechanical'],
         price: 5.99,
         images: [
            'https://lemanoosh.com/app/uploads/carl-hauser-0121-768x993.jpg',
         ],
      },
      {
         title: 'Carl Hauser Scanner',
         brand: 'Carl Hauser',
         categories: ['Electronics'],
         keywords: ['shoes', 'brushed', 'mechanical'],
         price: 22.99,
         images: [
            'https://lemanoosh.com/app/uploads/carl-hauser-020-768x973.jpg',
         ],
      },
      {
         title: 'Bright Neon Helmet',
         brand: 'Bright',
         categories: ['Electronics'],
         keywords: ['shoes', 'brushed', 'mechanical'],
         price: 17.99,
         images: [
            'https://lemanoosh.com/app/uploads/Orange_white-_Helmet_01.jpg',
         ],
      },
   ]

   const banners = [
      {
         image: 'https://marketplace.canva.com/EAFgoIbXL34/1/0/1600w/canva-beige-minimalist-mother%27s-day-sale-promotional-banner-YpclZeIn87Q.jpg',
         label: 'Something',
      },
      {
         image: 'https://globaltv.es/wp-content/uploads/2022/10/bang-olufsen-salon.webp',
         label: 'Something',
      },
      {
         image: 'https://marketplace.canva.com/EAFhXw50O8Q/1/0/1600w/canva-beige-minimalist-fashion-collection-photo-collage-banner-VTuOcmKhSd4.jpg',
         label: 'Something',
      },
      {
         image: 'https://marketplace.canva.com/EAFOMzwkPtk/1/0/1600w/canva-chic-website-homepage-fashion-collage-banner-QtOtaBX5FCE.jpg',
         label: 'Something',
      },
   ]

   try {
      for (const banner of banners) {
         const { image, label } = banner

         await prisma.banner.create({
            data: {
               id: nanoid(),
               image,
               label,
               updatedAt: new Date(),
            },
         })
      }

      console.log('Created Banners...')
   } catch (error) {
      console.error('Could not create banners...')
   }

   try {
      for (const owner of owners) {
         await prisma.owner.create({
            data: {
               id: nanoid(),
               email: owner,
               updatedAt: new Date(),
            },
         })
      }

      console.log('Created Owners...')
   } catch (error) {
      console.error('Could not create owners...')
   }

   try {
      for (const category of categories) {
         await prisma.category.create({
            data: {
               id: nanoid(),
               title: category,
               updatedAt: new Date(),
            },
         })
      }

      console.log('Created Categories...')
   } catch (error) {
      console.error('Could not create Categories...')
   }

   try {
      for (const product of products) {
         const createdProduct = await prisma.product.create({
            data: {
               id: nanoid(),
               isAvailable: getRandomBoolean(),
               title: product.title,
               price: getRandomFloat(20, 100, 2),
               stock: getRandomIntInRange(1, 20),
               discount: getRandomIntInRange(1, 15),
               updatedAt: new Date(),
               brand: {
                  connectOrCreate: {
                     where: {
                        title: product.brand,
                     },
                     create: {
                        id: nanoid(),
                        title: product.brand,
                        description: 'Description of this brand.',
                        color: '#3B82F6',
                     },
                  },
               },
               description: 'Description of this product.',
               images: product.images,
               keywords: product.keywords,
               categories: {
                  connect: {
                     title: product.categories[0],
                  },
               },
            },
            include: {
               categories: true,
            },
         })

         createdProducts.push(createdProduct)
      }

      console.log('Created Products...')
   } catch (error) {
      console.error('Could not create products...')
   }

   const user = await prisma.user.create({
      data: {
         id: nanoid(),
         email: 'sesto@post.com',
         name: 'Amirhossein Mohammadi',
         updatedAt: new Date(),
         Cart: {
            create: {
               updatedAt: new Date(),
            },
         },
         wishlist: {
            connect: {
               id: createdProducts[
                  getRandomIntInRange(0, createdProducts.length - 1)
               ]['id'],
            },
         },
      },
   })

   console.log('Created Users...')

   for (const provider of providers) {
      const createdProvider = await prisma.paymentProvider.create({
         data: {
            title: provider,
         },
      })

      createdProviders.push(createdProvider)
   }

   console.log('Created Providers...')

   for (let i = 0; i < 10; i++) {
      const order = await prisma.order.create({
         data: {
            createdAt: getRandomDate(new Date(2023, 2, 27), new Date()),
            payable: getRandomFloat(20, 100, 2),
            discount: getRandomFloat(20, 100, 2),
            shipping: getRandomFloat(20, 100, 2),
            status: 'Processing',
            user: { connect: { id: user.id } },
            isPaid: true,
            payments: {
               create: {
                  status: 'Processing',
                  isSuccessful: true,
                  payable: getRandomFloat(20, 100, 2),
                  refId: getRandomFloat(1, 200, 2).toString(),
                  user: {
                     connect: { id: user.id },
                  },
                  provider: {
                     connect: {
                        id: createdProviders[
                           getRandomIntInRange(0, createdProviders.length - 1)
                        ].id,
                     },
                  },
               },
            },
            orderItems: {
               create: {
                  productId:
                     createdProducts[
                        getRandomIntInRange(0, createdProducts.length - 1)
                     ]?.id,
                  count: 1,
                  price: createdProducts[
                     getRandomIntInRange(0, createdProducts.length - 1)
                  ].price,
                  discount: 0,
               },
            },
         },
      })
   }

   console.log('Created Orders...')
}

try {
   main()
   prisma.$disconnect()
} catch (error) {
   console.error(error)
   process.exit(1)
}
