const CompanyWebLayoutComponent = require('./CompanyWebLayoutComponent');

const KIND = CompanyWebLayoutComponent.KIND_HEADER;

class CompanyWebHeader {
  constructor(data) {
    this.id = data.id;
    this.companyId = data.companyId;
    this.name = data.name;
    this.isDefault = data.isDefault === true || data.isDefault === 1;
    this.content = data.content || null;
    this.createdAt = data.createdAt;
    this.updatedAt = data.updatedAt;
  }

  toJSON() {
    return {
      id: this.id,
      companyId: this.companyId,
      name: this.name,
      isDefault: this.isDefault,
      content: this.content,
      createdAt: this.createdAt,
      updatedAt: this.updatedAt,
    };
  }

  static _fromComponent(c) {
    if (!c || c.kind !== KIND) return null;
    return new CompanyWebHeader(c);
  }

  static async create(data) {
    const created = await CompanyWebLayoutComponent.create({
      ...data,
      kind: KIND,
    });
    return CompanyWebHeader._fromComponent(created);
  }

  static async findById(id) {
    const c = await CompanyWebLayoutComponent.findById(id);
    return CompanyWebHeader._fromComponent(c);
  }

  static async findByCompanyId(companyId) {
    const list = await CompanyWebLayoutComponent.findByCompanyId(companyId, KIND);
    return list.map((c) => CompanyWebHeader._fromComponent(c)).filter(Boolean);
  }

  static async findDefaultByCompanyId(companyId) {
    const c = await CompanyWebLayoutComponent.findDefaultByCompanyId(companyId, KIND);
    return CompanyWebHeader._fromComponent(c);
  }

  static async update(id, data) {
    const existing = await CompanyWebLayoutComponent.findById(id);
    if (!existing || existing.kind !== KIND) return null;
    const updated = await CompanyWebLayoutComponent.update(id, data);
    return CompanyWebHeader._fromComponent(updated);
  }

  static async delete(id) {
    const existing = await CompanyWebLayoutComponent.findById(id);
    if (!existing || existing.kind !== KIND) return false;
    return CompanyWebLayoutComponent.delete(id);
  }
}

module.exports = CompanyWebHeader;
