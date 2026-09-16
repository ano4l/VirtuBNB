import type { ProviderName } from "../domain/types.js";
import type { PropertyProvider } from "./contracts.js";

export class ProviderRegistry {
  private readonly providers = new Map<ProviderName, PropertyProvider>();

  register(provider: PropertyProvider): void {
    if (this.providers.has(provider.name)) throw new Error(`Provider already registered: ${provider.name}`);
    this.providers.set(provider.name, provider);
  }

  get(name: ProviderName): PropertyProvider {
    const provider = this.providers.get(name);
    if (!provider) throw new Error(`Provider is not registered: ${name}`);
    return provider;
  }
}
