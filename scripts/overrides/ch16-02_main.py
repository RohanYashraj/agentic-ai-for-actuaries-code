if __name__ == "__main__":
    # Exercise the tool directly against the shipped snapshot file.
    print(assess_capital_impact(
        publication_id="EIOPA-BoS-25-142",
        affected_business_lines=["motor_india", "commercial_property"],
        capital_model_snapshot_id="SNAP-FY2025-Q2",
    ))
