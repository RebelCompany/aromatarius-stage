/**
 * Requêtes GraphQL Storefront API. Typage via gql.tada en phase suivante
 * (pnpm shopify:codegen) ; en attendant, les réponses sont typées à la main
 * dans mappers.ts.
 */

export const METAFIELD_IDENTIFIERS = [
  "nazwa_lacinska",
  "rodzina_botaniczna",
  "czesc_rosliny",
  "metoda_ekstrakcji",
  "chemotyp",
  "pochodzenie",
  "certyfikat_bio",
  "analiza_pdf",
  "numer_partii",
  "glowne_skladniki",
  "na_co",
  "zapach_opis",
  "wlasciwosci",
  "jak_stosowac",
  "dawkowanie",
  "bezpieczenstwo",
  "wplyw_emocjonalny",
  "faq",
  "receptury_slugs",
  "kompendium_slug",
  "pasuje_do",
  "seo_title",
  "seo_description",
  "najnizsza_cena_30",
] as const;

const metafieldIdentifiersArg = METAFIELD_IDENTIFIERS.map(
  (key) => `{ namespace: "aromatarius", key: "${key}" }`,
).join(", ");

export const IMAGE_FRAGMENT = /* GraphQL */ `
  fragment ImageFields on Image {
    url
    altText
    width
    height
  }
`;

export const MONEY_FRAGMENT = /* GraphQL */ `
  fragment MoneyFields on MoneyV2 {
    amount
    currencyCode
  }
`;

export const PRODUCT_CARD_FRAGMENT = /* GraphQL */ `
  fragment ProductCardFields on Product {
    id
    handle
    title
    productType
    tags
    availableForSale
    updatedAt
    featuredImage { ...ImageFields }
    priceRange {
      minVariantPrice { ...MoneyFields }
      maxVariantPrice { ...MoneyFields }
    }
    variants(first: 1) { nodes { id } }
    nazwaLacinska: metafield(namespace: "aromatarius", key: "nazwa_lacinska") { value }
    chemotyp: metafield(namespace: "aromatarius", key: "chemotyp") { value }
  }
`;

export const PRODUCT_FRAGMENT = /* GraphQL */ `
  fragment ProductFields on Product {
    id
    handle
    title
    description
    descriptionHtml
    productType
    vendor
    tags
    availableForSale
    updatedAt
    seo { title description }
    featuredImage { ...ImageFields }
    images(first: 10) { nodes { ...ImageFields } }
    options { name values }
    priceRange {
      minVariantPrice { ...MoneyFields }
      maxVariantPrice { ...MoneyFields }
    }
    variants(first: 20) {
      nodes {
        id
        title
        sku
        availableForSale
        price { ...MoneyFields }
        compareAtPrice { ...MoneyFields }
        selectedOptions { name value }
        image { ...ImageFields }
      }
    }
    metafields(identifiers: [${metafieldIdentifiersArg}]) {
      key
      type
      value
      reference {
        ... on GenericFile { url }
        ... on MediaImage { image { url } }
      }
      references(first: 20) {
        nodes {
          ... on Metaobject {
            handle
            fields { key value }
          }
          ... on Product { handle }
        }
      }
    }
  }
`;

export const COLLECTION_FRAGMENT = /* GraphQL */ `
  fragment CollectionFields on Collection {
    id
    handle
    title
    description
    updatedAt
    image { ...ImageFields }
    seo { title description }
    intro: metafield(namespace: "aromatarius", key: "intro") { value }
    seoText: metafield(namespace: "aromatarius", key: "seo_text") { value }
    seoTitle: metafield(namespace: "aromatarius", key: "seo_title") { value }
    seoDescription: metafield(namespace: "aromatarius", key: "seo_description") { value }
    ikona: metafield(namespace: "aromatarius", key: "ikona") {
      reference { ... on MediaImage { image { url } } }
    }
    faq: metafield(namespace: "aromatarius", key: "faq") {
      references(first: 20) {
        nodes { ... on Metaobject { fields { key value } } }
      }
    }
  }
`;

export const CART_FRAGMENT = /* GraphQL */ `
  fragment CartFields on Cart {
    id
    checkoutUrl
    totalQuantity
    cost {
      subtotalAmount { ...MoneyFields }
      totalAmount { ...MoneyFields }
    }
    lines(first: 100) {
      nodes {
        id
        quantity
        cost { totalAmount { ...MoneyFields } }
        merchandise {
          ... on ProductVariant {
            id
            title
            sku
            price { ...MoneyFields }
            selectedOptions { name value }
            product {
              handle
              title
              featuredImage { ...ImageFields }
            }
          }
        }
      }
    }
  }
`;

export const GET_PRODUCT_QUERY = /* GraphQL */ `
  ${IMAGE_FRAGMENT}
  ${MONEY_FRAGMENT}
  ${PRODUCT_FRAGMENT}
  query GetProduct($handle: String!) {
    product(handle: $handle) { ...ProductFields }
  }
`;

export const GET_PRODUCTS_BY_HANDLES_QUERY = /* GraphQL */ `
  ${IMAGE_FRAGMENT}
  ${MONEY_FRAGMENT}
  ${PRODUCT_CARD_FRAGMENT}
  query GetProductsByHandles($query: String!, $first: Int!) {
    products(first: $first, query: $query) { nodes { ...ProductCardFields } }
  }
`;

export const GET_ALL_PRODUCT_HANDLES_QUERY = /* GraphQL */ `
  query GetAllProductHandles($cursor: String) {
    products(first: 250, after: $cursor) {
      pageInfo { hasNextPage endCursor }
      nodes { handle updatedAt }
    }
  }
`;

export const GET_COLLECTION_QUERY = /* GraphQL */ `
  ${IMAGE_FRAGMENT}
  ${COLLECTION_FRAGMENT}
  query GetCollection($handle: String!) {
    collection(handle: $handle) { ...CollectionFields }
  }
`;

export const GET_COLLECTIONS_QUERY = /* GraphQL */ `
  ${IMAGE_FRAGMENT}
  ${COLLECTION_FRAGMENT}
  query GetCollections {
    collections(first: 100) { nodes { ...CollectionFields } }
  }
`;

export const GET_COLLECTION_PRODUCTS_QUERY = /* GraphQL */ `
  ${IMAGE_FRAGMENT}
  ${MONEY_FRAGMENT}
  ${PRODUCT_CARD_FRAGMENT}
  query GetCollectionProducts(
    $handle: String!
    $first: Int!
    $after: String
    $sortKey: ProductCollectionSortKeys
    $reverse: Boolean
    $filters: [ProductFilter!]
  ) {
    collection(handle: $handle) {
      products(
        first: $first
        after: $after
        sortKey: $sortKey
        reverse: $reverse
        filters: $filters
      ) {
        pageInfo { hasNextPage endCursor }
        nodes { ...ProductCardFields }
      }
    }
  }
`;

export const SEARCH_QUERY = /* GraphQL */ `
  ${IMAGE_FRAGMENT}
  ${MONEY_FRAGMENT}
  ${PRODUCT_CARD_FRAGMENT}
  query Search($query: String!, $first: Int!) {
    search(query: $query, first: $first, types: [PRODUCT]) {
      nodes { ... on Product { ...ProductCardFields } }
    }
    predictiveSearch(query: $query, limit: 4, types: [COLLECTION]) {
      collections { handle title }
    }
  }
`;

export const GET_SHOP_QUERY = /* GraphQL */ `
  query GetShop {
    shop {
      name
      description
      primaryDomain { host }
      freeShipping: metafield(namespace: "aromatarius", key: "free_shipping_threshold") { value }
    }
  }
`;

export const GET_METAOBJECT_QUERY = /* GraphQL */ `
  query GetMetaobject($handle: MetaobjectHandleInput!) {
    metaobject(handle: $handle) {
      id
      type
      handle
      fields { key value }
    }
  }
`;

export const CART_CREATE_MUTATION = /* GraphQL */ `
  ${IMAGE_FRAGMENT}
  ${MONEY_FRAGMENT}
  ${CART_FRAGMENT}
  mutation CartCreate($input: CartInput) {
    cartCreate(input: $input) {
      cart { ...CartFields }
      userErrors { field message }
    }
  }
`;

export const CART_QUERY = /* GraphQL */ `
  ${IMAGE_FRAGMENT}
  ${MONEY_FRAGMENT}
  ${CART_FRAGMENT}
  query GetCart($id: ID!) {
    cart(id: $id) { ...CartFields }
  }
`;

export const CART_LINES_ADD_MUTATION = /* GraphQL */ `
  ${IMAGE_FRAGMENT}
  ${MONEY_FRAGMENT}
  ${CART_FRAGMENT}
  mutation CartLinesAdd($cartId: ID!, $lines: [CartLineInput!]!) {
    cartLinesAdd(cartId: $cartId, lines: $lines) {
      cart { ...CartFields }
      userErrors { field message }
    }
  }
`;

export const CART_LINES_UPDATE_MUTATION = /* GraphQL */ `
  ${IMAGE_FRAGMENT}
  ${MONEY_FRAGMENT}
  ${CART_FRAGMENT}
  mutation CartLinesUpdate($cartId: ID!, $lines: [CartLineUpdateInput!]!) {
    cartLinesUpdate(cartId: $cartId, lines: $lines) {
      cart { ...CartFields }
      userErrors { field message }
    }
  }
`;

export const CART_LINES_REMOVE_MUTATION = /* GraphQL */ `
  ${IMAGE_FRAGMENT}
  ${MONEY_FRAGMENT}
  ${CART_FRAGMENT}
  mutation CartLinesRemove($cartId: ID!, $lineIds: [ID!]!) {
    cartLinesRemove(cartId: $cartId, lineIds: $lineIds) {
      cart { ...CartFields }
      userErrors { field message }
    }
  }
`;
