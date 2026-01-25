# Analytics Dashboard API Documentation

## Overview
Single endpoint providing **14 real-time metrics** for the seller dashboard. All data calculated from MongoDB with parallel queries for optimal performance.

**Endpoint:** `GET /api/v2/dashboard/analytics`

**Response Time:** ~1-2 seconds (all metric groups run in parallel)

---

## Response Structure

```json
{
  "total_revenue": 5000.00,
  "total_orders_sold": 50,
  "average_order_value": 100.00,
  "best_selling_product": {
    "product_id": "123",
    "product_name": "T-Shirt",
    "units_sold": 150,
    "total_revenue": 2250.00
  },
  "total_units_sold": 200,
  "revenue_per_product": [...],
  "week_orders": 12,
  "month_orders": 50,
  "total_conversations": 100,
  "total_messages": 500,
  "chat_to_order_conversion_rate": 25.5,
  "abandoned_chats": 30,
  "active_chats": 5,
  "most_asked_questions": [
    { "question": "what is the price?", "frequency": 25 }
  ],
  "low_stock_products": [...]
}
```

---

## Metrics Breakdown

### Sales Metrics (6)
| Metric | Type | Description |
|--------|------|-------------|
| `total_revenue` | float | Sum of all order totals (₹) |
| `total_orders_sold` | int | Total number of orders |
| `average_order_value` | float | Revenue ÷ Orders |
| `best_selling_product` | object | Top product by revenue |
| `total_units_sold` | int | Sum of all quantities |
| `revenue_per_product` | array | All products ranked by revenue |

### Period Metrics (2)
| Metric | Type | Description |
|--------|------|-------------|
| `week_orders` | int | Orders in last 7 days |
| `month_orders` | int | Orders in last 30 days |

### Chat Metrics (5)
| Metric | Type | Description |
|--------|------|-------------|
| `total_conversations` | int | Total Instagram conversations |
| `total_messages` | int | Total messages across all chats |
| `chat_to_order_conversion_rate` | float | % of chats that led to orders |
| `abandoned_chats` | int | Conversations without purchases |
| `active_chats` | int | Updated in last 48 hours |
| `most_asked_questions` | array | Top 5 FAQ (extracted from messages) |

### Bonus (1)
| Metric | Type | Description |
|--------|------|-------------|
| `low_stock_products` | array | Products with stock < 10 |

---

## React Usage Examples

### Fetch Analytics
```jsx
const [analytics, setAnalytics] = useState(null);
const [loading, setLoading] = useState(true);

useEffect(() => {
  fetch('/api/v2/dashboard/analytics', {
    headers: { 'Authorization': `Bearer ${token}` }
  })
    .then(r => r.json())
    .then(data => {
      setAnalytics(data);
      setLoading(false);
    })
    .catch(err => console.error(err));
}, []);
```

### Display Revenue Card
```jsx
<Card>
  <h3>Total Revenue</h3>
  <p className="text-2xl">₹{analytics?.total_revenue.toLocaleString()}</p>
  <small>{analytics?.total_orders_sold} orders</small>
</Card>
```

### Best Selling Product
```jsx
{analytics?.best_selling_product && (
  <div>
    <h4>{analytics.best_selling_product.product_name}</h4>
    <p>₹{analytics.best_selling_product.total_revenue}</p>
    <p>{analytics.best_selling_product.units_sold} units sold</p>
  </div>
)}
```

### Sales Trend (Week vs Month)
```jsx
<LineChart data={[
  { period: 'Week', orders: analytics?.week_orders },
  { period: 'Month', orders: analytics?.month_orders }
]} />
```

### Chat Conversion Funnel
```jsx
<div>
  <p>Conversations: {analytics?.total_conversations}</p>
  <p>Conversion Rate: {analytics?.chat_to_order_conversion_rate.toFixed(1)}%</p>
  <p>Abandoned: {analytics?.abandoned_chats}</p>
  <p>Active: {analytics?.active_chats}</p>
</div>
```

### FAQ Section
```jsx
<ul>
  {analytics?.most_asked_questions.map(faq => (
    <li key={faq.question}>
      <strong>Q:</strong> {faq.question} 
      <span badge>{faq.frequency} times</span>
    </li>
  ))}
</ul>
```

### Low Stock Alert
```jsx
{analytics?.low_stock_products.length > 0 && (
  <Alert severity="warning">
    {analytics.low_stock_products.map(p => (
      <p key={p.product_id}>
        {p.product_name}: {p.current_stock}/{p.threshold}
      </p>
    ))}
  </Alert>
)}
```

---

## Error Handling

On error, API returns **zero/empty values** (graceful degradation):
```jsx
// Check if loading
if (loading) return <Skeleton />;

// All values safe (never null/undefined)
<p>Revenue: ₹{analytics?.total_revenue || 0}</p>
```

---

## Tips for Frontend

1. **Cache the data** - Results don't change frequently, cache for 5-10 minutes
2. **Lazy load** - Show KPI cards first, detailed charts after
3. **Real-time updates** - Consider polling every 5 minutes or WebSocket
4. **Mobile responsive** - Cards stack on mobile
5. **Timezone aware** - "Last 7 days" uses UTC timezone

---

## Performance Notes

- ✅ All 4 metric groups fetch in **parallel** (not sequential)
- ✅ Typical response: **~1-2 seconds**
- ✅ No pagination needed (dashboard data)
- ✅ Returns zero values on partial errors (no 500s)

---

## Related Endpoints

- Product Management: `/api/v2/products`
- Orders: `/api/v2/orders`
- Conversations: `/api/v2/conversations`
- Business Config: `/api/v2/dashboard/business-config`
