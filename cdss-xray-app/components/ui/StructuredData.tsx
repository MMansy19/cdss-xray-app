'use client';

interface StructuredDataProps {
  type: 'website' | 'organization' | 'medicalWebPage' | 'article' | 'software';
  name: string;
  description: string;
  url?: string;
  imageUrl?: string;
  datePublished?: string;
  dateModified?: string;
  authorName?: string;
  customData?: Record<string, any>;
}

const StructuredData: React.FC<StructuredDataProps> = ({
  type,
  name,
  description,
    url = typeof window !== 'undefined' ? window.location.href : 'https://cdss-xray-app.vercel.app',
  imageUrl = '/logo3.png',
  datePublished,
  dateModified,
  authorName = 'CDSS X-Ray Team',
  customData = {}
}) => {
  // Generate different types of structured data based on the provided type
  const generateStructuredData = () => {
    const baseData = {
      '@context': 'https://schema.org',
      'name': name,
      'description': description,
      'url': url,
    };

    if (type === 'website') {
      return {
        '@type': 'WebSite',
        ...baseData,
        'potentialAction': {
          '@type': 'SearchAction',
          'target': `${url}/search?q={search_term_string}`,
          'query-input': 'required name=search_term_string'
        },
        ...customData
      };
    }

    if (type === 'organization') {
      return {
        '@type': 'Organization',
        ...baseData,
        'logo': imageUrl ? new URL(imageUrl, url).toString() : undefined,
        ...customData
      };
    }

    if (type === 'medicalWebPage') {
      return {
        '@type': 'MedicalWebPage',
        ...baseData,
        'image': imageUrl ? new URL(imageUrl, url).toString() : undefined,
        'specialty': 'Radiology',
        'audience': 'Healthcare Professionals',
        'lastReviewed': dateModified || new Date().toISOString().split('T')[0],
        ...customData
      };
    }

    if (type === 'article') {
      return {
        '@type': 'Article',
        ...baseData,
        'image': imageUrl ? new URL(imageUrl, url).toString() : undefined,
        'author': { '@type': 'Person', 'name': authorName },
        'publisher': {
          '@type': 'Organization',
          'name': 'CDSS X-Ray',
          'logo': {
            '@type': 'ImageObject',
            'url': new URL('/logo3.png', url).toString()
          }
        },
        'datePublished': datePublished || new Date().toISOString().split('T')[0],
        'dateModified': dateModified || new Date().toISOString().split('T')[0],
        ...customData
      };
    }

    if (type === 'software') {
      return {
        '@type': 'SoftwareApplication',
        ...baseData,
        'applicationCategory': 'MedicalApplication',
        'operatingSystem': 'Web',
        'offers': {
          '@type': 'Offer',
          'price': '0',
          'priceCurrency': 'USD'
        },
        ...customData
      };
    }

    // Default schema for other types
    return {
      '@type': type,
      ...baseData,
      ...customData
    };
  };

  const structuredData = generateStructuredData();

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
    />
  );
};

export default StructuredData;