import pandas as pd

def clean_id(series: pd.Series) -> pd.Series:
    """Convert id-like column to clean string without trailing decimals."""
    series = series.fillna('')
    series = series.astype(str).str.strip()
    series = series.str.replace(r'\.0$', '', regex=True)
    return series

# Meta
bev_meta = pd.read_csv(
    '/content/PepsiCo_Bev_Meta_Campaign_Report-2025061206.csv',
    dtype=str
)
bev_meta['Platform'] = 'Meta'

food_meta = pd.read_csv(
    '/content/PepsiCo_Food_Meta_Campaign_Report_-_QA-2025061206.csv',
    dtype=str
)
food_meta['Platform'] = 'Meta'

# Pinterest
bev_pinterest = pd.read_csv(
    '/content/PepsiCo_Bev_Pinterest_Campaign_Report-2025061206.csv',
    dtype=str
)
bev_pinterest['Platform'] = 'Pinterest'
bev_pinterest = bev_pinterest.rename(columns={
    'Platform Ad Group ID': 'Platform Ad Set ID',
    'Pinterest Standard Passthrough Measured Impressions': 'Measured Impressions',
    'Pinterest Standard Viewable Impressions': 'Viewable Impressions',
    'Platform Ad Group Name': 'Platform Ad Set Name'
})

food_pinterest = pd.read_csv(
    '/content/PepsiCo_Food_Pinterest_Campaign_Report-2025061207.csv',
    dtype=str
)
food_pinterest['Platform'] = 'Pinterest'
food_pinterest = food_pinterest.rename(columns={
    'Platform Ad Group ID': 'Platform Ad Set ID',
    'Pinterest Standard Passthrough Measured Impressions': 'Measured Impressions',
    'Pinterest Standard Viewable Impressions': 'Viewable Impressions',
    'Platform Ad Group Name': 'Platform Ad Set Name'
})

# Snapchat
bev_snapchat = pd.read_csv(
    '/content/PepsiCo_Bev_Snapchat_Campaign_Report-2025061206.csv',
    dtype=str
)
bev_snapchat['Platform'] = 'Snapchat'

food_snapchat = pd.read_csv(
    '/content/PepsiCo_Food_Snapchat_Campaign_Report_-_Copy-2025061207.csv',
    dtype=str
)
food_snapchat['Platform'] = 'Snapchat'

# TikTok
bev_tiktok = pd.read_csv(
    '/content/PepsiCo_Bev_TikTok_Campaign_Report-2025061206.csv',
    dtype=str
)
bev_tiktok['Platform'] = 'tiktok'
bev_tiktok = bev_tiktok.rename(columns={
    'Viewability Measured Impressions': 'Measured Impressions'
})

food_tiktok = pd.read_csv(
    '/content/PepsiCo_Food_TikTok_Campaign_Report-2025061207.csv',
    dtype=str
)
food_tiktok['Platform'] = 'tiktok'
food_tiktok = food_tiktok.rename(columns={
    'Viewability Measured Impressions': 'Measured Impressions'
})

# Standard Campaign
bev_campaign = pd.read_csv(
    '/content/PepsiCo_Bev_Campaign_Report-2025061206.csv',
    dtype=str
)
bev_campaign['Platform'] = 'Standard'
bev_campaign = bev_campaign.rename(columns={
    'Ad Server Placement Code': 'Platform Ad Set ID',
    'Placement Name': 'Platform Ad Set Name',
    'Ad Server Campaign Code': 'Platform Campaign ID',
    'Campaign Name': 'Platform Campaign Name'
})

food_campaign = pd.read_csv(
    '/content/PepsiCo_Food_Campaign_Report-2025061207.csv',
    dtype=str
)
food_campaign['Platform'] = 'Standard'
food_campaign = food_campaign.rename(columns={
    'Ad Server Placement Code': 'Platform Ad Set ID',
    'Placement Name': 'Platform Ad Set Name',
    'Ad Server Campaign Code': 'Platform Campaign ID',
    'Campaign Name': 'Platform Campaign Name'
})

pinnacle_combined = pd.concat([
    bev_meta, bev_pinterest, bev_snapchat, bev_tiktok, bev_campaign,
    food_meta, food_pinterest, food_snapchat, food_tiktok, food_campaign
], ignore_index=True)

pinterest_DV = pd.read_csv(
    '/content/Pinterest DV (18).csv',
    dtype=str
)
pinterest_DV['Platform'] = 'Pinterest'
pinterest_DV['month'] = pinterest_DV['month'].astype(str) + '-01'
pinterest_DV = pinterest_DV.rename(columns={
    'Platform Ad Group ID': 'Platform Ad Set ID',
    'Platform Ad Group Name': 'Platform Ad Set Name'
})

meta_DV = pd.read_csv(
    '/content/Meta DV (18).csv',
    dtype=str
)
meta_DV['Platform'] = 'Meta'
meta_DV['month'] = meta_DV['month'].astype(str) + '-01'

tiktok_DV = pd.read_csv(
    '/content/TikTok DV (18) 1.csv',
    dtype=str
)
tiktok_DV['Platform'] = 'tiktok'
tiktok_DV['month'] = tiktok_DV['month'].astype(str) + '-01'

snapchat_DV = pd.read_csv(
    '/content/Snapchat DV (18).csv',
    dtype=str
)
snapchat_DV['Platform'] = 'Snapchat'
snapchat_DV['month'] = snapchat_DV['month'].astype(str) + '-01'

toplevel_25 = pd.read_excel(
    '/content/toplevelDV-2025-06-12.xlsx',
    dtype=str
)
toplevel_25 = toplevel_25.rename(columns={
    'Campaign_name': 'platform_campaign_name',
    'Placement_id': 'platform_ad_set_id',
    'placement_name': 'platform_ad_set_name',
    'Account_name': 'platform_account_name',
    'Campaign_id': 'platform_campaign_id',
    'Report date': 'repdate'
})

DV_combined = pd.concat([
    pinterest_DV, meta_DV, tiktok_DV, snapchat_DV, toplevel_25
], join='outer', ignore_index=True).fillna('')

def build_summary_pinnacle(df: pd.DataFrame) -> pd.DataFrame:
    summary = df.groupby([
        'Brand Market', 'Brand Name', 'Platform', 'Platform Account ID',
        'Platform Campaign ID', 'Platform Ad Set ID', 'Platform Ad ID'
    ], dropna=False, as_index=False).agg({
        'Measured Impressions': 'sum',
        'Viewable Impressions': 'sum',
        'Monitored Ads': 'sum'
    })
    summary = summary.rename(columns={
        'Platform Campaign ID': 'Campaign ID',
        'Platform Ad Set ID': 'Placement ID',
        'Platform Ad ID': 'Creative ID'
    })
    for col in ['Campaign ID', 'Placement ID', 'Creative ID', 'Platform']:
        summary[col] = clean_id(summary[col])
    summary['primary_key'] = summary.apply(
        lambda r: (
            r['Campaign ID'] + r['Placement ID'] + r['Creative ID']
            if r['Platform'].lower() == 'tiktok'
            else r['Campaign ID'] + r['Placement ID']
        ),
        axis=1
    )
    return summary

def build_summary_dv(df: pd.DataFrame) -> pd.DataFrame:
    df['monitored_ads_numeric'] = pd.to_numeric(
        df['monitored_ads'], errors='coerce'
    ).fillna(0)
    summary = df.groupby([
        'brand', 'Platform', 'platform_account_id',
        'platform_campaign_id', 'platform_ad_set_id',
        'monitored_ads', 'platform_ad_id'
    ], dropna=False).agg({
        'measured_impressions': lambda x: x.notna().sum(),
        'viewable_impressions': 'sum',
        'monitored_ads_numeric': 'sum'
    }).reset_index().rename(columns={
        'measured_impressions': 'Datamesh Measured Impressions',
        'viewable_impressions': 'Datamesh Viewable Impressions',
        'monitored_ads_numeric': 'Datamesh Monitored Ads'
    })
    summary = summary.rename(columns={
        'platform_campaign_id': 'Campaign ID',
        'platform_ad_set_id': 'Placement ID',
        'platform_ad_id': 'QA Categorizer'
    })
    for col in ['Campaign ID', 'Placement ID', 'QA Categorizer', 'Platform']:
        summary[col] = clean_id(summary[col])
    summary['primary_key'] = summary.apply(
        lambda r: (
            r['Campaign ID'] + r['Placement ID'] + r['QA Categorizer']
            if r['Platform'].lower() == 'tiktok'
            else r['Campaign ID'] + r['Placement ID']
        ),
        axis=1
    )
    return summary

summary_pinnacle = build_summary_pinnacle(pinnacle_combined)
summary_DV = build_summary_dv(DV_combined)

smart_sheet = pd.read_excel(
    '/content/Smartsheet data 06-11-2025.xlsx',
    dtype=str
)
valid_issues = [
    'Live > 5 Days, No DV',
    'Flight Ended, No DV',
    'Flight Ended, Only Partial DV',
    'Live 1-5 Days, No DV',
    'Only Partial DV',
    'Live > 10 Days, No DV',
    'Live 1-10 Days, No DV'
]
smart_sheet_filtered = smart_sheet[
    smart_sheet['Issue Category'].isin(valid_issues)
].copy()
for col in ['Campaign ID', 'Placement ID', 'Ad ID (TikTok Only)', 'Platform']:
    smart_sheet_filtered[col] = clean_id(smart_sheet_filtered[col])
smart_sheet_filtered['primary_key'] = smart_sheet_filtered.apply(
    lambda r: (
        r['Campaign ID'] + r['Placement ID'] + r['Ad ID (TikTok Only)']
        if r['Platform'].lower() == 'tiktok'
        else r['Campaign ID'] + r['Placement ID']
    ),
    axis=1
)

merged_pinnacle = summary_pinnacle.merge(
    smart_sheet_filtered,
    on='primary_key',
    how='inner',
    suffixes=('_pinnacle', '_smart')
)

merged_DV = summary_DV.merge(
    smart_sheet_filtered,
    on='primary_key',
    how='inner',
    suffixes=('_pinnacle', '_smart')
)

merged_left = merged_pinnacle.merge(
    merged_DV,
    on='primary_key',
    how='left',
    suffixes=('_pinnacle', '_dv')
)
merged_left.to_csv('merged_left_join.csv', index=False)

merged_inner = merged_pinnacle.merge(
    merged_DV,
    on='primary_key',
    how='inner',
    suffixes=('_pinnacle', '_dv')
)
merged_inner.to_csv('merged_inner_join.csv', index=False)

merged_right = merged_pinnacle.merge(
    merged_DV,
    on='primary_key',
    how='right',
    suffixes=('_pinnacle', '_dv')
)
merged_right.to_csv('merged_right_join.csv', index=False)
