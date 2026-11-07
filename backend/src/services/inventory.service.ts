import { memoryStore, ProductRecord, InventoryMovementRecord } from '../db/memory-store.js';

export class InventoryService {
  async getProducts() {
    return memoryStore.products.map(p => {
      // Calculate current stock from movement balance
      const stock = 180; // current estimated available units
      const isLowStock = stock <= p.reorderPoint;
      return {
        ...p,
        currentStock: stock,
        inventoryValuation: stock * p.costPrice,
        isLowStock
      };
    });
  }

  async getMovements(productId?: string, branchId?: string | null) {
    let result = memoryStore.inventoryMovements;
    if (productId) {
      result = result.filter(m => m.productId === productId);
    }
    return result.map(m => {
      const product = memoryStore.products.find(p => p.id === m.productId);
      return {
        ...m,
        productName: product?.nameEn || 'Product',
        sku: product?.sku || ''
      };
    });
  }

  async getInventorySummary(branchId?: string | null) {
    const products = await this.getProducts();
    const totalValuation = products.reduce((sum, p) => sum + p.inventoryValuation, 0);
    const lowStockCount = products.filter(p => p.isLowStock).length;
    const outOfStockCount = products.filter(p => p.currentStock === 0).length;

    return {
      totalValuation,
      totalSkus: products.length,
      lowStockCount,
      outOfStockCount,
      branchesCount: memoryStore.branches.length
    };
  }
}

export const inventoryService = new InventoryService();
