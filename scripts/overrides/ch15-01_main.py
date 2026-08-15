if __name__ == "__main__":
    result = value_scheme("UKDB-MER-001", "2025-03-31")
    print(f"status: {result['status']}")
    print(f"technical_provisions_gbp:     {result['technical_provisions_gbp']:,.0f}")
    print(f"long_term_funding_target_gbp: {result['long_term_funding_target_gbp']:,.0f}")
    print("sensitivity_panel:")
    for scenario, value in result["sensitivity_panel"].items():
        print(f"  {scenario:<22} {value:,.0f}")
    print(f"assumption_basis: {result['assumption_basis']}")
