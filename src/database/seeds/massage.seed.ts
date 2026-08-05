import { MassagePricing, MassagePricingType, massages, massageTranslations, MassageTranslationType, MassageType } from "../database.schema"
import db from "../drizzle"

type MassageSeed = MassageType & { pricing: Omit<MassagePricingType, 'massageId' | 'id'>[] } & { translations: Omit<MassageTranslationType, 'massageId'>[] }

const data: MassageSeed[] = [{
    id: "a0000000-0000-0000-0000-000000000001",
    image: "https://upload.youcanbook.me/v/ycbm/8538c748-0195-449e-9c27-dbb22f4f8cdf/images/bioelectric_massage_2_1.png",
    order: 1,
    translations: [
        {
            description: '▯MUST TRY▯ BioElectric Reset Therapy (BMT)',
            languageCode: 'en',
            name: `▯ MUST TRY: The Future of Wellness Is Here. ▯ Zen exclusive available starting July 31, 2025.

The revolutionary therapy that combines 3,000 years of Traditional Chinese Medicine wisdom with cutting-edge modern technology.

Unlike traditional massage, BMT uses gentle electrical currents to stimulate your body's natural energy pathways (meridians), promoting healing from within. Think of it as acupuncture's high-tech cousin - but without the needles!

▯ Perfect for:
• Chronic pain relief
• Stress & tension reduction
• Better sleep & energy levels
• Faster muscle recovery
• Overall wellness optimization`,
        },
        {
            description: `▯ PHẢI THỬ ▯ Liệu Pháp Massage Điện Sinh Học (BMT)

▯ PHẢI THỬ: Tương lai của Sức Khỏe Toàn Diện đã đến. ▯ Dịch vụ độc quyền tại Zen, bắt đầu từ ngày 31 tháng 7, 2025.

Liệu pháp mang tính cách mạng này kết hợp 3.000 năm trí tuệ của Y học Cổ truyền Trung Hoa với công nghệ hiện đại tiên tiến.

Khác với massage truyền thống, BMT sử dụng dòng điện nhẹ để kích thích các đường năng lượng tự nhiên (kinh mạch) trong cơ thể, giúp chữa lành từ bên trong. Hãy tưởng tượng nó như phiên bản công nghệ cao của châm cứu – nhưng không cần kim!

▯‍♂️ Phù hợp với:
• Giảm đau mãn tính
• Giảm căng thẳng & áp lực
• Ngủ ngon hơn & tăng năng lượng
• Hồi phục cơ nhanh hơn
• Tối ưu hóa sức khỏe toàn diện`,
            languageCode: 'vi',
            name: '▯MUST TRY▯ BioElectric Reset Therapy (BMT)'
        }
    ],
    pricing: [
        {
            price: 1270000,
            duration: 60,
        },
    ],
},
{
    id: "a0000000-0000-0000-0000-000000000002",
    image: "https://upload.youcanbook.me/v/ycbm/8538c748-0195-449e-9c27-dbb22f4f8cdf/images/z4749429874891_537943e4f1de7a7c367264e3938a3319.jpg",
    order: 2,
    translations: [
        {
            description: `Trải nghiệm độc đáo này kết hợp nghệ thuật của các kỹ thuật Thái và Shiatsu, được tăng cường với các loại tinh dầu được tuyển chọn đặc biệt của chúng tôi. Liệu trình kết thúc bằng liệu pháp đá nóng nhẹ nhàng, được thiết kế để giải phóng các cơ căng thẳng và xua tan mệt mỏi, cuối cùng giúp bạn cảm thấy trẻ hóa, hồi sinh và sẵn sàng bắt đầu cuộc phiêu lưu kỳ nghỉ của mình.`,
            languageCode: 'vi',
            name: 'Zen Night Recovery',
        },
        {
            description: `This unique experience blends the artistry of Thai and Shiatsu techniques, enriched with our specially curated essential oils. The journey culminates in a soothing hot stone therapy, designed to unlock tense muscles and melt away fatigue, ultimately leaving you feeling rejuvenated, revitalized, and ready to embark on your holiday adventure.`,
            languageCode: 'en'
            , name: 'Zen Night Recovery'
        }
    ],
    pricing: [
        {
            price: 930000,
            duration: 60,
        }, {
            price: 1230000,
            duration: 90,
        }, {
            price: 1570000,
            duration: 120,
        },
    ],
}, {
    id: "a0000000-0000-0000-0000-000000000003",
    image: "https://upload.youcanbook.me/v/ycbm/8538c748-0195-449e-9c27-dbb22f4f8cdf/images/z4749429851909_a5a91611bdfedca508279d7a3d2b3812.jpg",
    order: 3,
    pricing: [
        {
            price: 720000,
            duration: 60,
        }, {
            price: 970000,
            duration: 90,
        }, {
            price: 1270000,
            duration: 120,
        },
    ],
    translations: [{
        name: 'Zen Wellness Traditional',
        languageCode: 'en',
        description: "A rejuvenating mix of Thai and Swedish inspired massage therapy designed to unlock your body's joints, unblock trapped energy, and enhance circulation, leaving you with a revitalized and invigorated sensation."
    }, {
        languageCode: 'vi', description: 'Sự kết hợp giữa liệu pháp mát-xa lấy cảm hứng từ Thái Lan và Thụy Điển giúp trẻ hóa các khớp xương, giải phóng năng lượng bị tích tụ và tăng cường lưu thông máu, mang lại cho bạn cảm giác tươi mới và sảng khoái.',
        name: 'Zen Wellness Traditional',
    }]
}, {
    id: "a0000000-0000-0000-0000-000000000004",
    image: "https://upload.youcanbook.me/v/ycbm/8538c748-0195-449e-9c27-dbb22f4f8cdf/images/couple_massage_ads_creative_3.png",
    order: 4,
    pricing: [
        {
            price: 1440000,
            duration: 60,
        },
        {
            price: 1950000,
            duration: 90,
        }, {
            price: 2500000,
            duration: 120,
        },
    ],
    translations: [
        {
            name: 'Couple Wellness Recovery',
            languageCode: 'en',
            description: `Experience the ultimate relaxation with our Zen Couple's Wellness Massage, combining Thai and Swedish techniques to unlock joints, release trapped energy, and boost circulation. This rejuvenating therapy promotes deep relaxation, relieves tension, and leaves you feeling revitalized. Share the soothing benefits with a loved one and enjoy a truly restorative experience together.

We will send 1 male and 1 female therapist in default. If you prefer 2 female or 2 male therapists, please mention in the NOTES/INSTRUCTIONS upon checkout.`
        }, {
            name: 'Couple Wellness Recovery',
            languageCode: 'vi',
            description: `Trải nghiệm sự thư giãn tuyệt đối với dịch vụ Massage chăm sóc sức khỏe Zen Couple của chúng tôi, kết hợp các kỹ thuật của Thái Lan và Thụy Điển để mở khóa các khớp, giải phóng năng lượng và tăng cường lưu thông. Liệu pháp trẻ hóa này thúc đẩy sự thư giãn sâu, giảm căng thẳng và giúp bạn cảm thấy tràn đầy sức sống. Chia sẻ những lợi ích thư giãn với người thân yêu và cùng nhau tận hưởng trải nghiệm phục hồi thực sự.

Chúng tôi sẽ gửi 1 nam và 1 nữ nhân viên theo mặc định. Nếu bạn muốn 2 nữ hoặc 2 nam trị liệu, vui lòng ghi chú trong phần GHI CHÚ/HƯỚNG DẪN khi đặt booking.`},
    ],
}

    , {
    id: "a0000000-0000-0000-0000-000000000005",
    image: "https://upload.youcanbook.me/v/ycbm/8538c748-0195-449e-9c27-dbb22f4f8cdf/images/z4749429869050_3469082a47141ae23b730e69dec25b55.jpg",
    order: 5,
    pricing: [
        {
            price: 800000,
            duration: 60,
        }, {
            price: 1050000,
            duration: 90,
        }, {
            price: 1400000,
            duration: 120,
        },
    ],
    translations: [{
        name: 'Massage Đá Nóng Toàn Thân',
        languageCode: 'vi',
        description: 'Một phương pháp toàn diện khai thác sức mạnh của đá nóng kết hợp với các động tác vuốt tay khéo léo và các loại tinh dầu được pha chế đặc biệt. Trải nghiệm giải pháp tối ưu để xua tan căng thẳng cơ, tăng cường sự linh hoạt của khớp và cải thiện chất lượng giấc ngủ của bạn.'
    }, {
        languageCode: 'en',
        name: 'Hot Stone Full Body Ritual',
        description: 'An all-encompassing approach that harnesses the power of heated stones in synergy with expertly crafted gliding hand strokes and specially formulated oils. Experience the ultimate solution to melt away muscle tension, enhance joint flexibility, and enhance your sleep quality.'
    }]
}, {
    id: "a0000000-0000-0000-0000-000000000006",
    image: "https://upload.youcanbook.me/v/ycbm/8538c748-0195-449e-9c27-dbb22f4f8cdf/images/z4749429806157_cfd6a1ce925cc9e6581328fd83310c4f.jpg",
    order: 6,
    pricing: [
        {
            price: 900000,
            duration: 60,
        }, {
            price: 1200000,
            duration: 90,
        }, {
            price: 1570000,
            duration: 120,
        },
    ],
    translations: [{
        name: 'Massage Toàn Thân Tinh Dầu (Sả/ Oải Hương)',
        languageCode: 'vi',
        description: 'Đắm mình trong trải nghiệm nhẹ nhàng kết hợp các kỹ thuật lướt nhẹ nhàng để làm ấm và kéo dài các sợi cơ của bạn, giúp cải thiện lưu thông máu và giảm căng thẳng đáng kể. Liệu pháp độc quyền của chúng tôi có các loại dầu được chế tạo đặc biệt được thiết kế để nâng cao sức khỏe tổng thể của bạn, khiến đây trở thành một trải nghiệm mà bạn sẽ không muốn bỏ lỡ.'
    }, {
        languageCode: 'en',
        name: 'Full Body Aromatherapy Recovery (Lemongrass/Lavender)',
        description: 'Immerse yourself in a soothing experience that combines gentle gliding techniques to warm and elongate your muscle fibers, resulting in improved blood circulation and a profound reduction in tension. Our exclusive therapy features specially crafted oils designed to elevate your overall well-being, making it an indulgence you won\'t want to miss.'
    }]
}, {
    id: "a0000000-0000-0000-0000-000000000007",
    image: "https://upload.youcanbook.me/v/ycbm/8538c748-0195-449e-9c27-dbb22f4f8cdf/images/z4749429801085_198345a62713a3d78a7f0c017ce4b1ac.jpg",
    order: 7,
    pricing: [
        {
            price: 720000,
            duration: 60,
        }, {
            price: 970000,
            duration: 90,
        }, {
            price: 1270000,
            duration: 120,
        },
    ],
    translations: [{
        name: 'Trị Liệu Chân Và Bàn Chân Bằng Đá Nóng',
        languageCode: 'vi',
        description: 'Hương thơm tự nhiên của dừa tạo nên bầu không khí yên tĩnh, biến buổi massage của bạn thành một hành trình trẻ hóa. Tinh dầu massage của chúng tôi chứa đầy vitamin và chất chống oxy hóa, không chỉ giúp thư giãn cơ mà còn nuôi dưỡng làn da của bạn, giúp da mềm mại và rạng rỡ. Hãy nâng cao thói quen chăm sóc bản thân và tận hưởng trải nghiệm với loại dầu massage cao cấp này. Làn da của bạn xứng đáng được nuôi dưỡng bởi những tinh túy hòa quyện này.'
    }, {
        languageCode: 'en',
        name: 'Foot & Leg Therapy with Hot Stone',
        description: 'The natural aroma of coconut creates a tranquil atmosphere, turning your massage into a rejuvenating journey. Packed with vitamins and antioxidants, our massage oil not only relaxes muscles but also nurtures your skin, leaving it supple and radiant. Elevate your self-care routine and embrace the pure indulgence of this premium massage oil, where the essence of paradise meets the nourishing touch your skin deserves.'
    }]
}, {
    id: "a0000000-0000-0000-0000-000000000008",
    image: "https://upload.youcanbook.me/v/ycbm/8538c748-0195-449e-9c27-dbb22f4f8cdf/images/client-with-suction-cup-process_2.jpg",
    order: 8,
    pricing: [
        {
            price: 1120000,
            duration: 60,
        }, {
            price: 1360000,
            duration: 90,
        }, {
            price: 1630000,
            duration: 120,
        },
    ],
    translations: [{
        name: 'Giác hơi',
        languageCode: 'vi',
        description: 'Giác hơi là một phương thức trị liệu có nguồn gốc từ Trung Quốc. Giác hơi là dùng hơi nóng hoặc bơm hút chân không tạo thành một áp suất âm trong ống (bầu) giác, làm ống giác hút chặt vào da chỗ giác để sơ thông kinh mạch, hoạt huyết khử ứ, chỉ thống, phục hồi cân bằng âm dương, giúp giảm đau, giảm viêm, giải độc hoặc phòng và điều trị một số bệnh lý.'
    }, {
        languageCode: 'en',
        name: 'Zen Wellness with Cupping',
        description: 'Cupping is a therapy method originating from China. Cupping therapy is an ancient form of alternative medicine where a therapist puts special cups on your skin for a few minutes to create suction. People get it for many reasons, such as pain and inflammation relief, relaxation and well-being, and as a type of deep-tissue massage.'
    }]
}]

export default async function runMassageSeed() {
    await Promise.all(data.map(s => handleSeed(s)))
        console.log(`Massage seeded successfully!`);

}


async function handleSeed(seed: MassageSeed) {
    const { pricing, translations, ...rest } = seed
    const massageId = rest.id

    // Upsert massage
    await db.insert(massages)
        .values(rest)
        .onConflictDoUpdate({
            target: massages.id,
            set: { ...rest }
        })

    // Handle pricing upserts (assuming duration & massageId can act as conflict target or you can adjust target columns)

    await db.delete(MassagePricing)
    for (const p of pricing) {
        await db.insert(MassagePricing)
            .values({ ...p, massageId })

    }

    // Handle translation upserts (assuming massageId & languageCode act as conflict target)
    for (const t of translations) {
        await db.insert(massageTranslations)
            .values({ ...t, massageId })
            .onConflictDoUpdate({
                target: [massageTranslations.massageId, massageTranslations.languageCode],
                set: { ...t }
            })
    }

}
