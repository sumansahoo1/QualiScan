import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Accordion, Box, Group, ScrollArea, Text, Pagination, Badge, Container, Flex, Paper, Textarea } from '@mantine/core';
import axios from 'axios';

const Dashboard = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const page = parseInt(searchParams.get('page') || '1', 10);
  const [data, setData] = useState([]);
  const [totalPages, setTotalPages] = useState(1);

  useEffect(() => {
    async function fetchData() {
      try {
        const response = await axios.get(`/api/orders/?page=${page}&limit=10`);
        setData(response.data.orders || []);
        setTotalPages(Math.ceil(response.data.total / response.data.limit));
      } catch (error) {
        console.error('Error fetching orders:', error);
        setData([]);
      }
    }
    fetchData();
  }, [page]);

  const handlePageChange = (newPage) => {
    setSearchParams({ page: newPage });
  };

  const items = data?.map((order) => (
    <Accordion.Item key={order._id || order.order_id} value={order._id || order.order_id}>
      <Accordion.Control>
        <Flex px="sm">
          <Text className="truncate"> Order: {order.order_id || 'N/A'}</Text>
          <Badge color={order.matched ? 'green' : 'red'} style={{ marginLeft: 'auto' }}>
            {order.matched ? 'Matched' : 'Unmatched'}
          </Badge>
        </Flex>
      </Accordion.Control>
      <Accordion.Panel>
        <Group grow>
          <Box className="w-full h-80 overflow-auto">
            <ScrollArea>
              {(order.expected_values || []).map((product, index) => (
                <Textarea
                  key={`expected-${index}`}
                  value={JSON.stringify(product, (key, value) => value, 2)}
                  autosize
                  minRows={1}
                  maxRows={10}
                  readOnly
                  className="whitespace-pre-wrap break-words font-mono"
                  variant="filled"
                  size="sm"
                  label="Expected Products"
                  description="JSON representation of the product"
                  resize="vertical"
                  radius="md"
                />
              ))}
            </ScrollArea>
          </Box>
          <Box className="w-full h-80 overflow-auto">
            <ScrollArea>
              {(order.actual_values || []).map((product, index) => (
                <Textarea
                  key={`actual-${index}`}
                  value={JSON.stringify(product, (key, value) => value, 2)}
                  autosize
                  minRows={2}
                  maxRows={10}
                  readOnly
                  className="whitespace-pre-wrap break-words"
                  variant="filled"
                  size="sm"
                  label="Actual Products"
                  description="JSON representation of the product"
                  resize="vertical"
                  radius="md"
                />
              ))}
            </ScrollArea>
          </Box>
        </Group>
      </Accordion.Panel>
    </Accordion.Item>
  ));

  return (
    <Container fluid p="sm">
      <Flex direction="column" gap="md" align="center" p="sm">
        <Paper withBorder p="sm" className="w-full">
          <Accordion defaultValue="O001" className="w-full">
            {items}
          </Accordion>
        </Paper>
        <Pagination total={totalPages} value={page} onChange={handlePageChange} size="md" />
      </Flex>
    </Container>
  );
};

export default Dashboard;
