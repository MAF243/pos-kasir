import { Link } from '@inertiajs/react';

export default function Pagination({ links = [] }) {
    // If there's only 1 page, Laravel sends an array of 3 links (prev, page 1, next).
    // No need to render pagination if there is only one page.
    if (links.length <= 3) return null;

    return (
        <div className="flex flex-wrap items-center justify-center sm:justify-end gap-1 mt-6">
            {links.map((link, index) => {
                // Determine if this is the "Previous" or "Next" button
                const isPrevious = index === 0;
                const isNext = index === links.length - 1;

                if (link.url === null) {
                    return (
                        <div
                            key={index}
                            className="px-4 py-2 text-sm leading-4 text-gray-400 bg-gray-50 border border-gray-200 rounded-lg cursor-not-allowed shadow-sm"
                            dangerouslySetInnerHTML={{ __html: link.label }}
                        />
                    );
                }

                return (
                    <Link
                        key={index}
                        href={link.url}
                        preserveState
                        preserveScroll
                        className={`px-4 py-2 text-sm leading-4 border rounded-lg transition-all duration-200 shadow-sm ${
                            link.active
                                ? 'bg-primary-50 text-primary-700 border-primary-500 font-semibold ring-1 ring-primary-500'
                                : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50 hover:text-gray-900 focus:border-primary-500 focus:text-primary-500'
                        }`}
                        dangerouslySetInnerHTML={{ __html: link.label }}
                    />
                );
            })}
        </div>
    );
}
