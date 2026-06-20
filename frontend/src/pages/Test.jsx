import { useState, useEffect } from 'react';
import {
  Button, Container, Text, Grid, Group,
  Stack, TextInput, LoadingOverlay, Accordion,
  ActionIcon, Image, SimpleGrid, Paper
} from '@mantine/core';
import { Dropzone, MIME_TYPES } from '@mantine/dropzone';
import { Trash, Plus } from 'lucide-react';
import { motion } from 'framer-motion';
import defaultExamples from '/src/constants/default_values.json';
import ImageCard from '/src/components/ImageCard';
import { formFields, DEFAULT_PRODUCT_STRUCTURE } from '/src/constants/constants';

const Test = () => {
  const [selectedImageFile, setSelectedImageFile] = useState(null);
  const [selectedImageURL, setSelectedImageURL] = useState(null);
  const [loading, setLoading] = useState(false);
  const [products, setProducts] = useState(DEFAULT_PRODUCT_STRUCTURE);
  const [defaultExampleImages, setDefaultExampleImages] = useState([]);

  useEffect(() => {
    if (loading) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'auto';
    }
  }, [loading]);

  useEffect(() => {
    const loadDefaultExamples = async () => {
      try {
        const examples = await Promise.all(
          defaultExamples.map(async (example) => {
            const response = await fetch(`/src/assets/default_examples/${example.image}`);
            const blob = await response.blob();
            return {
              ...example,
              file: new File([blob], example.image, { type: blob.type }),
              url: URL.createObjectURL(blob)
            };
          })
        );
        setDefaultExampleImages(examples);
      } catch (error) {
        console.error('Error loading default examples:', error);
      }
    };

    loadDefaultExamples();
  }, []);

  const handleImageUpload = (files) => {
    const file = files[0];
    if (file) {
      setSelectedImageFile(file);
      setSelectedImageURL(URL.createObjectURL(file));
    }
  };

  const handleProcessImage = async () => {
    setLoading(true);
    if (!selectedImageFile) {
      alert('Please select an image first.');
      return;
    }

    const formData = new FormData();
    formData.append('image', selectedImageFile);

    const expectedValues = products.map((product) => ({
      manufacturer: product.manufacturer,
      product_name: product.productName,
      ingredients: product.ingredients,
      manufacturing_date: product.manufacturingDate,
      expiry_date: product.expiryDate,
      net_weight: product.netWeight,
      barcode: product.barcode,
      other_details: product.otherDetails,
    }));

    formData.append('expected_values', JSON.stringify(expectedValues));

    await fetch('/api/process-ocr/', {
      method: 'POST',
      body: formData,
    }).catch((error) => {
      console.error('Error processing image:', error);
      alert('An error occurred while processing the image.');
    });

    handleDiscardImage();
    setLoading(false);
  };

  const handleDiscardImage = () => {
    setSelectedImageFile(null);
    setSelectedImageURL(null);
    setProducts([
      {
        manufacturer: '',
        productName: '',
        ingredients: '',
        manufacturingDate: '',
        expiryDate: '',
        netWeight: '',
        barcode: '',
        otherDetails: '',
      },
    ]);
  };

  const handleProductChange = (index, field, value) => {
    const newProducts = [...products];
    newProducts[index][field] = value;
    setProducts(newProducts);
  };

  const handleRemoveProduct = (index) => {
    const newProducts = products.filter((_, i) => i !== index);
    setProducts(newProducts);
  };

  const handleDefaultExampleSelect = (example) => {
    setSelectedImageFile(example.file);
    setSelectedImageURL(example.url);
    setProducts([{
      manufacturer: example.values.manufacturer,
      productName: example.values.productName,
      ingredients: example.values.ingredients,
      manufacturingDate: example.values.manufacturingDate,
      expiryDate: example.values.expiryDate,
      netWeight: example.values.netWeight,
      barcode: example.values.barcode,
      otherDetails: example.values.otherDetails,
    }]);
  };

  const handleAddProduct = () => {
    setProducts([
      ...products,
      {
        manufacturer: '',
        productName: '',
        ingredients: '',
        manufacturingDate: '',
        expiryDate: '',
        netWeight: '',
        barcode: '',
        otherDetails: '',
      },
    ]);
  };

  return (
    <Container fluid p="sm">
      <LoadingOverlay
        visible={loading}
        zIndex={1000}
        overlayProps={{ radius: 'sm', blur: 2 }}
        loaderProps={{ color: 'blue', type: 'bars' }}
        pos="fixed"
        top={0}
        left={0}
      />
      <Grid >
        <Grid.Col span={3}>
          <Paper p="md" radius="md" withBorder>
            <Stack gap="md">
              <Text size="lg" fw={500}>Default Examples</Text>
            <SimpleGrid cols={2} spacing="sm" verticalSpacing="sm">
              {defaultExampleImages.map((example, index) => (
                <ImageCard
                  key={index}
                  example={example}
                  onClick={() => handleDefaultExampleSelect(example)}
                />
              ))}
            </SimpleGrid>
          </Stack>
          </Paper>
        </Grid.Col>
        <Grid.Col span={9}>
          <Paper p="md" radius="md" withBorder>
            <Stack align="center" spacing="md" w="100%">
              <Dropzone
                onDrop={handleImageUpload}
                accept={[MIME_TYPES.png, MIME_TYPES.jpeg]}
                multiple={false}
                className="w-full border-2 border-dashed border-gray-300 p-8 text-center mb-4 rounded-lg hover:border-blue-500 transition-colors"
              >
                <Text align="center" c="textSecondary">Drag & Drop an image here</Text>
                <Text align="center" c="textSecondary">or</Text>
                <Button mt="sm" className="bg-blue-600 hover:bg-blue-700" size="md">Upload Image</Button>
              </Dropzone>
              {selectedImageURL && (
                <Paper p="md" radius="md" w="100%" withBorder>
                  <Paper p="sm" pos="relative">
                    <Button pos="absolute" top={8} right={8} color="red" onClick={handleDiscardImage} size="sm" compact>
                      Discard
                    </Button>
                    <Text c="gray">Selected Image: {selectedImageFile.name}</Text>
                    <Image src={selectedImageURL} alt="Selected" fit="contain" w="100%" h="300" radius="md"/>
                  </Paper>
                  <Paper withBorder>
                    <Accordion p="sm">
                      {products?.map((product, index) => (
                        <motion.div
                          key={index}
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ duration: 0.3 }}
                        >
                          <Accordion.Item p="md" label={`Product ${index + 1}`} pos="relative">
                              <Stack spacing="sm">
                                {formFields.map((field) => (
                                  <TextInput
                                    key={field.name}
                                    label={field.label}
                                    value={product[field.name]}
                                    onChange={(e) => handleProductChange(index, field.name, e.target.value)}
                                  />
                                ))}
                                <ActionIcon pos="absolute" variant="danger" top={4} right={4} onClick={() => handleRemoveProduct(index)} size="lg">
                                  <Trash size={16} />
                                </ActionIcon>
                              </Stack>
                          </Accordion.Item>
                        </motion.div>
                      ))}
                    </Accordion>
                  </Paper>
                  <Group position="center" mt="md">
                  <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3 }}
                >
                  <Button className='rounded-lg' onClick={handleAddProduct} leftIcon={<Plus size={16} />} size="sm">
                    Add Another Product
                  </Button>
                </motion.div>

                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.3 }}
                    >
                      <Button className='rounded-lg bg-blue-600 hover:bg-blue-700' onClick={handleProcessImage} size="sm">
                        Process
                      </Button>
                    </motion.div>
                  </Group>
                </Paper>
              )}
            </Stack>
          </Paper>
        </Grid.Col>
      </Grid>
    </Container>
  );
}

export default Test;
